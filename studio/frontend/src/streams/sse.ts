export interface SseFrame {
  event: string;
  data: string;
  id?: string;
}

/** 按 SSE 行规则解析流，保留跨网络 chunk 的半行和多行 data。 */
export async function* readSse(stream: ReadableStream<Uint8Array>): AsyncGenerator<SseFrame> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let event = 'message';
  let data: string[] = [];
  let id: string | undefined;
  try {
    while (true) {
      const chunk = await reader.read();
      buffer += decoder.decode(chunk.value, { stream: !chunk.done });
      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);
        if (!line) {
          if (data.length) yield { event, data: data.join('\n'), id };
          event = 'message';
          data = [];
          id = undefined;
        } else if (!line.startsWith(':')) {
          const colon = line.indexOf(':');
          const key = colon < 0 ? line : line.slice(0, colon);
          const value = colon < 0 ? '' : line.slice(colon + 1).replace(/^ /, '');
          if (key === 'event') event = value;
          if (key === 'data') data.push(value);
          if (key === 'id') id = value;
        }
      }
      if (chunk.done) break;
    }
  } finally {
    reader.releaseLock();
  }
}
