import type { OperationAccepted, OperationView, SessionRef } from './types';

export class ApiFailure extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details: unknown,
  ) {
    super(message);
  }
}

/** 所有 HTTP 错误在传输边界统一转为可呈现错误。 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers:
      init.body instanceof FormData
        ? init.headers
        : { 'Content-Type': 'application/json', ...init.headers },
  });
  if (!response.ok) {
    const content = await response.json();
    const error = content.error;
    throw new ApiFailure(
      response.status,
      error?.code ?? 'HTTP_ERROR',
      error?.message ?? response.statusText,
      error?.details ?? content,
    );
  }
  return response.json() as Promise<T>;
}

export function post<T>(path: string, body: unknown = {}): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function sessionPath(ref: SessionRef): string {
  return `/api/stores/${encodeURIComponent(ref.store_binding_id)}/sessions/${encodeURIComponent(ref.session_id)}`;
}

export function runPath(store: string, run: string): string {
  return `/api/stores/${encodeURIComponent(store)}/runs/${encodeURIComponent(run)}`;
}

/** 已准入操作只读轮询，断线后不会重发 mutation。 */
export async function waitOperation(
  accepted: OperationAccepted,
  onProgress?: (operation: OperationView) => void,
): Promise<OperationView> {
  while (true) {
    const operation = await request<OperationView>(`/api/operations/${accepted.operation_id}`);
    onProgress?.(operation);
    if (operation.state === 'failed')
      throw new ApiFailure(
        500,
        operation.error?.code ?? 'OPERATION_FAILED',
        operation.error?.message ?? '操作失败',
        operation.error?.details,
      );
    if (operation.state === 'succeeded') return operation;
    await new Promise((resolve) => setTimeout(resolve, 700));
  }
}
