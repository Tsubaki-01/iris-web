import { useEffect, useRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { X, LoaderCircle } from 'lucide-react';

export function Button({
  variant = 'neutral',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'neutral' | 'ghost' | 'danger';
}) {
  return <button className={`button ${variant} ${className}`} {...props} />;
}

export function EmptyState({
  title,
  children,
  icon,
}: {
  title: string;
  children?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="empty-card">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      <div className="muted">{children}</div>
    </div>
  );
}

export function ErrorNotice({ error }: { error: unknown }) {
  return error ? (
    <div className="error-notice" role="alert">
      {error instanceof Error ? error.message : String(error)}
    </div>
  ) : null;
}

export function Loading({ text = '正在读取…' }: { text?: string }) {
  return (
    <div className="loading" role="status">
      <LoaderCircle size={16} className="spin" />
      {text}
    </div>
  );
}

/** 原生 dialog 提供 focus trap、Escape 和关闭后的焦点恢复。 */
export function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = ref.current!;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? 'dialog wide' : 'dialog'}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <header>
        <h2>{title}</h2>
        <Button variant="ghost" aria-label="关闭" onClick={onClose}>
          <X size={18} />
        </Button>
      </header>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}

export function JsonDetails({
  value,
  label = '完整记录',
  open = false,
}: {
  value: unknown;
  label?: string;
  open?: boolean;
}) {
  return (
    <details className="json-details" open={open}>
      <summary>{label}</summary>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </details>
  );
}
