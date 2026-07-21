import type { HttpRequest } from '@angular/common/http';

/**
 * Single registry entry: every mock URL handler the front-end falls back to
 * when the real backend is not yet available or the user is in a preview
 * environment. PR-A scaffolds the registry; PR-D will populate it with the
 * `assignments` endpoints.
 */
export interface MockBackendHandler {
  readonly id: string;
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  readonly matchKind: 'exact' | 'prefix' | 'regex';
  readonly pattern: string | RegExp;
  readonly delayMs?: number;
  readonly failureStatus?: number;
  readonly resolve: (
    request: Pick<HttpRequest<unknown>, 'method' | 'url' | 'body' | 'params'>,
  ) => unknown;
}

/**
 * Order matters: the first matching handler wins. New handlers should be
 * inserted BEFORE the default fallback so the fallback never masks them in
 * production builds.
 */
export const mockBackendHandlers: readonly MockBackendHandler[] = [];
