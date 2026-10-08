import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { request, sessionPath } from '../api/client';
import type { LiveEnvelope, SessionBootstrap, SessionRef } from '../api/types';
import type { StreamReady } from '../api/generated/sse';
import { readSse } from './sse';
import { initialSessionState, sessionReducer } from './reducer';

export function useSession(ref: SessionRef | null) {
  const [state, dispatch] = useReducer(sessionReducer, initialSessionState);
  const [connection, setConnection] = useState<'offline' | 'connecting' | 'connected'>('offline');
  const [error, setError] = useState<unknown>(null);
  const client = useQueryClient();
  const refreshRef = useRef<() => Promise<void>>(async () => {});
  const backendEpoch = useRef<string | null>(null);
  const path = ref ? sessionPath(ref) : null;
  const sessionId = ref?.session_id;
  useEffect(() => {
    dispatch({ type: 'reset', sessionKey: path });
    setError(null);
    if (!path || !sessionId) {
      setConnection('offline');
      return;
    }
    const controller = new AbortController();
    let cursor = '';
    let readyEpoch = '';
    let syncing = false;
    let queuedRefresh = false;
    let buffer: LiveEnvelope[] = [];
    let retryTimer: ReturnType<typeof setTimeout>;
    const refresh = async (): Promise<void> => {
      if (syncing) {
        queuedRefresh = true;
        return;
      }
      syncing = true;
      const requestedEpoch = readyEpoch;
      try {
        const value = await request<SessionBootstrap>(`${path}/bootstrap`, {
          signal: controller.signal,
        });
        if (controller.signal.aborted || requestedEpoch !== readyEpoch) return;
        dispatch({ type: 'snapshot', value });
        for (const envelope of buffer) dispatch({ type: 'live', envelope, sessionId });
        buffer = [];
        client.invalidateQueries({ queryKey: ['sessions'] });
      } catch (caught) {
        if (!controller.signal.aborted) throw caught;
      } finally {
        syncing = false;
        if (queuedRefresh && !controller.signal.aborted) {
          queuedRefresh = false;
          void refresh().catch(setError);
        }
      }
    };
    refreshRef.current = refresh;
    const connect = async (): Promise<void> => {
      setConnection('connecting');
      try {
        const response = await fetch(`${path}/stream`, {
          signal: controller.signal,
          headers: cursor ? { 'Last-Event-ID': cursor } : {},
        });
        if (!response.ok || !response.body) throw new Error(`流连接失败 (${response.status})`);
        for await (const frame of readSse(response.body)) {
          if (controller.signal.aborted) return;
          if (frame.id) cursor = frame.id;
          if (frame.event === 'stream.ready') {
            const ready = JSON.parse(frame.data) as StreamReady;
            if (backendEpoch.current && backendEpoch.current !== ready.backend_epoch) {
              client.removeQueries({ queryKey: ['configuration'] });
            }
            backendEpoch.current = ready.backend_epoch;
            void client.invalidateQueries({ queryKey: ['app'] });
            if (readyEpoch !== ready.stream_epoch) {
              buffer = [];
              cursor = '';
            }
            readyEpoch = ready.stream_epoch;
            dispatch({ type: 'ready', epoch: ready.stream_epoch });
            setConnection('connected');
            setError(null);
            void refresh().catch(setError);
            continue;
          }
          if (frame.event === 'replay.gap') {
            dispatch({ type: 'gap' });
            void refresh().catch(setError);
            client.invalidateQueries({ queryKey: ['inspection'] });
            continue;
          }
          if (frame.event === 'subscription.terminal') break;
          const envelope = JSON.parse(frame.data) as LiveEnvelope;
          if (syncing) buffer.push(envelope);
          else dispatch({ type: 'live', envelope, sessionId });
          if (envelope.durable_sequence != null || envelope.kind === 'session.control.changed')
            void refresh().catch(setError);
          if (envelope.durable_sequence != null || !envelope.kind!.startsWith('model.block.'))
            client.invalidateQueries({ queryKey: ['inspection'] });
        }
        if (!controller.signal.aborted) throw new Error('连接已断开，正在重连…');
      } catch (caught) {
        if (controller.signal.aborted) return;
        setError(caught);
        setConnection('offline');
        retryTimer = setTimeout(() => void connect(), 1500);
      }
    };
    void connect();
    return () => {
      controller.abort();
      clearTimeout(retryTimer);
      refreshRef.current = async () => {};
    };
  }, [path, sessionId, client]);
  const refresh = useCallback(() => refreshRef.current(), []);
  return { state, connection, error, refresh, dispatch };
}
