import { useState } from 'react';
import type { MediaView, SessionRef } from '../../api/types';

export interface ComposerDraft {
  text: string;
  mode: 'auto' | 'steer' | 'follow_up';
  attachments: MediaView[];
}
const emptyDraft: ComposerDraft = { text: '', mode: 'auto', attachments: [] };
export function composerKey(session: SessionRef): string {
  return `${session.store_binding_id}/${session.session_id}`;
}

/** 会话切换保存本地草稿，不把本地文字冒充已准入输入。 */
export function useComposer(key: string) {
  const [drafts, setDrafts] = useState<Record<string, ComposerDraft>>({});
  const draft = drafts[key] ?? emptyDraft;
  const update = (target: string, edit: (previous: ComposerDraft) => ComposerDraft): void =>
    setDrafts((previous) => ({ ...previous, [target]: edit(previous[target] ?? emptyDraft) }));
  return {
    ...draft,
    update,
    key,
    move: (target: string): void => {
      setDrafts((previous) => ({ ...previous, [target]: draft, [key]: emptyDraft }));
    },
  };
}
