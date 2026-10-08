import { useEffect, useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button, ErrorNotice } from '../../components/Primitives';
import type { Schema } from '../../api/types';

export function SpeechInput({
  generationId,
  disabled,
  onText,
}: {
  generationId: string;
  disabled: boolean;
  onText: (text: string) => void;
}) {
  const [recording, setRecording] = useState(false);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [partial, setPartial] = useState('');
  const [error, setError] = useState<unknown>(null);
  const resources = useRef<{
    socket?: WebSocket;
    context?: AudioContext;
    stream?: MediaStream;
    node?: AudioWorkletNode;
  }>({});
  const onTextRef = useRef(onText);
  onTextRef.current = onText;
  const releaseAudio = (): void => {
    resources.current.node?.disconnect();
    resources.current.stream?.getTracks().forEach((track) => track.stop());
    void resources.current.context?.close();
    resources.current.context = undefined;
  };
  useEffect(
    () => () => {
      releaseAudio();
      resources.current.socket?.close();
    },
    [generationId],
  );
  const start = async (): Promise<void> => {
    setStarting(true);
    setError(null);
    setPartial('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true },
      });
      resources.current.stream = stream;
      const context = new AudioContext({ sampleRate: 16000 });
      resources.current.context = context;
      await context.audioWorklet.addModule('/pcm-worklet.js');
      const socket = new WebSocket(
        `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/generations/${generationId}/speech`,
      );
      resources.current.socket = socket;
      socket.onmessage = (message) => {
        const event = JSON.parse(String(message.data)) as
          Schema['SpeechTranscript'] | Schema['SpeechError'];
        if (event.type === 'error') {
          setError(new Error(event.message));
          releaseAudio();
          setRecording(false);
          setFinishing(false);
        } else if (event.type === 'transcript' && event.is_final) {
          onTextRef.current(event.text);
          setPartial('');
        } else if (event.type === 'transcript') setPartial(event.text);
      };
      socket.onclose = () => {
        releaseAudio();
        setRecording(false);
        setFinishing(false);
      };
      await new Promise<void>((resolve, reject) => {
        socket.onopen = () => resolve();
        socket.onerror = () => reject(new Error('无法连接语音服务'));
      });
      const node = new AudioWorkletNode(context, 'iris-pcm-capture');
      resources.current.node = node;
      node.port.onmessage = (event: MessageEvent<Float32Array>) => {
        if (socket.readyState !== WebSocket.OPEN) return;
        const pcm = new ArrayBuffer(event.data.length * 2);
        const view = new DataView(pcm);
        event.data.forEach((sample, index) =>
          view.setInt16(index * 2, Math.round(Math.max(-1, Math.min(1, sample)) * 32767), true),
        );
        socket.send(pcm);
      };
      context.createMediaStreamSource(stream).connect(node);
      node.connect(context.destination);
      await context.resume();
      setRecording(true);
    } catch (caught) {
      releaseAudio();
      resources.current.socket?.close();
      setError(caught);
    } finally {
      setStarting(false);
    }
  };
  const stop = (): void => {
    releaseAudio();
    resources.current.socket?.send(JSON.stringify({ type: 'finish' }));
    setRecording(false);
    setFinishing(true);
  };
  return (
    <div className="speech-input">
      <Button
        variant="ghost"
        aria-label={recording ? '结束录音' : '语音输入'}
        disabled={disabled || finishing || starting}
        onClick={() => (recording ? stop() : void start())}
      >
        {recording ? <Square size={17} /> : <Mic size={17} />}
      </Button>
      {(partial || finishing) && (
        <span className="speech-transcript" role="status">
          {partial || '等待最终转录…'}
        </span>
      )}
      <ErrorNotice error={error} />
    </div>
  );
}
