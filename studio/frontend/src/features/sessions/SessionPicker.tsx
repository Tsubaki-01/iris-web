import type { Schema, SessionRef } from '../../api/types';
import { Dialog, EmptyState } from '../../components/Primitives';
import { StoreSessions } from './StoreSessions';

export function SessionPicker({
  data,
  selected,
  open,
  close,
}: {
  data: Schema['WorkspaceSessions'] | undefined;
  selected: SessionRef | null;
  open: (ref: SessionRef) => Promise<void>;
  close: () => void;
}) {
  const choose = async (ref: SessionRef): Promise<void> => {
    await open(ref);
    close();
  };
  return (
    <Dialog title="会话列表" onClose={close}>
      <div className="session-browser">
        {data?.drafts.map((view) => (
          <button
            key={`${view.ref.store_binding_id}/${view.ref.session_id}`}
            onClick={() => void choose(view.ref)}
          >
            {view.title || '新会话'}
          </button>
        ))}
        {data?.stores.map((store) => (
          <StoreSessions
            key={store.store_binding_id}
            store={store}
            selected={selected}
            open={choose}
          />
        ))}
        {!data?.drafts.length && !data?.stores.some((store) => store.page.items.length) && (
          <EmptyState title="暂无会话">选择 Agent 后可创建新会话。</EmptyState>
        )}
      </div>
    </Dialog>
  );
}
