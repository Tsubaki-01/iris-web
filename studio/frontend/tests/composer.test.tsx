import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useComposer } from '../src/features/chat/useComposer';

describe('per-session composer', () => {
  it('isolates drafts across storage bindings and restores a previous draft', () => {
    const { result, rerender } = renderHook(({ session }) => useComposer(session), {
      initialProps: { session: 'store-a/same-id' },
    });
    act(() => result.current.update(result.current.key, (old) => ({ ...old, text: 'A 草稿' })));
    rerender({ session: 'store-b/same-id' });
    expect(result.current.text).toBe('');
    act(() => result.current.update(result.current.key, (old) => ({ ...old, text: 'B 草稿' })));
    rerender({ session: 'store-a/same-id' });
    expect(result.current.text).toBe('A 草稿');
  });
});
