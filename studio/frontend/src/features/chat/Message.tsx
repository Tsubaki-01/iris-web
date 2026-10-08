import ReactMarkdown from 'react-markdown';
import { Wrench } from 'lucide-react';
import type { UiMessage, UiPart } from '../../api/types';
import { JsonDetails } from '../../components/Primitives';

function Part({ part }: { part: UiPart }) {
  if (part.type === 'text')
    return (
      <div className="markdown">
        <ReactMarkdown>{part.text}</ReactMarkdown>
      </div>
    );
  if (part.type === 'image')
    return (
      <a href={part.media.original_url} target="_blank" rel="noreferrer">
        <img
          className="message-image"
          src={part.media.original_url}
          alt={part.name ?? '消息图片'}
          loading="lazy"
        />
      </a>
    );
  if (part.type === 'tool_use')
    return (
      <details className="tool-message">
        <summary>
          <Wrench size={14} />
          {part.name}
          <span className="muted">工具调用</span>
        </summary>
        <JsonDetails value={part.input} label="参数" open />
      </details>
    );
  return (
    <details className={`tool-message ${part.is_error ? 'failed' : ''}`}>
      <summary>
        <Wrench size={14} />
        {part.name}
        <span className="muted">{part.is_error ? '执行失败' : '工具结果'}</span>
      </summary>
      {part.content.map((item, index) => (
        <Part key={index} part={item} />
      ))}
      <JsonDetails value={part.metadata} label="结果元数据" />
    </details>
  );
}

export function Message({ message }: { message: UiMessage }) {
  const hasTool = message.parts.some(
    (part) => part.type === 'tool_use' || part.type === 'tool_result',
  );
  const fromUser = message.role === 'user' && message.sender === 'user' && !hasTool;
  return (
    <article className={`message ${fromUser ? 'from-user' : ''}`} data-ordinal={message.ordinal}>
      <div className="message-label">
        {fromUser
          ? '你'
          : hasTool
            ? '工具'
            : message.role === 'assistant'
              ? 'Iris'
              : message.sender}
      </div>
      {message.parts.map((part, index) => (
        <Part key={index} part={part} />
      ))}
    </article>
  );
}
