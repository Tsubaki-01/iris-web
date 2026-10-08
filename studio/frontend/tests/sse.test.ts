import { describe, expect, it } from 'vitest';
import { readSse } from '../src/streams/sse';

describe('SSE wire parsing', () => {
  it('buffers split UTF-8 chunks and supports multiline data, ids, heartbeats', async () => {
    const bytes = new TextEncoder().encode(
      ': beat\r\nevent: stream.ready\r\ndata: {"title":"会话"}\r\n\r\nid: cursor\nevent: model.block.delta\ndata: first\ndata: second\n\n',
    );
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let n = 0; n < bytes.length; n += 3) controller.enqueue(bytes.slice(n, n + 3));
        controller.close();
      },
    });
    const frames = [];
    for await (const frame of readSse(stream)) frames.push(frame);
    expect(frames).toEqual([
      { event: 'stream.ready', data: '{"title":"会话"}', id: undefined },
      { event: 'model.block.delta', data: 'first\nsecond', id: 'cursor' },
    ]);
  });
});
