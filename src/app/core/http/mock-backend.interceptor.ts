import type {
  HttpInterceptorFn,
  HttpRequest} from '@angular/common/http';
import {
  HttpResponse,
} from '@angular/common/http';
import type { Observable} from 'rxjs';
import { defer, of } from 'rxjs';
import { delay } from 'rxjs/operators';

import {
  mockBackendHandlers,
  type MockBackendHandler,
} from '../mocks/mock-handlers';

/**
 * Functional HTTP interceptor that resolves selected requests against the
 * `core/mocks` registry instead of letting them reach the network. It only
 * activates when `window.__ORION_MOCK_BACKEND__ === true`, which keeps the
 * safety lever in the operator's hands rather than hardcoded into the build.
 *
 * Handlers register URLs + arbitrary matchers and a function that returns
 * the desired body (or throws). The interceptor runs each one in registry
 * order; the first match wins.
 */
export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isMockBackendEnabled()) {
    return next(req);
  }
  for (const handler of mockBackendHandlers) {
    if (matches(handler, req)) {
      return simulate(handler, req);
    }
  }
  return next(req);
};

export function isMockBackendEnabled(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      (window as { __ORION_MOCK_BACKEND__?: boolean }).__ORION_MOCK_BACKEND__,
    )
  );
}

function matches(
  handler: MockBackendHandler,
  req: HttpRequest<unknown>,
): boolean {
  if (handler.method !== req.method.toUpperCase()) {
    return false;
  }
  const target = req.urlWithParams;
  const pattern = handler.pattern;
  if (handler.matchKind === 'exact') {
    return pattern === target;
  }
  if (handler.matchKind === 'prefix') {
    return typeof pattern === 'string' && target.startsWith(pattern);
  }
  if (handler.matchKind === 'regex') {
    return pattern instanceof RegExp && pattern.test(target);
  }
  return false;
}

function simulate(
  handler: MockBackendHandler,
  req: HttpRequest<unknown>,
): Observable<HttpResponse<unknown>> {
  return defer(() => {
    try {
      const body = handler.resolve(req);
      return of(
        new HttpResponse({
          status: 200,
          url: req.urlWithParams,
          body,
        }),
      );
    } catch (error) {
      const status = handler.failureStatus ?? 500;
      const payload = {
        success: false,
        statusCode: status,
        message: error instanceof Error ? error.message : 'mock failure',
      };
      return of(
        new HttpResponse({
          status,
          url: req.urlWithParams,
          body: payload,
        }),
      );
    }
  }).pipe(delay(handler.delayMs ?? 0));
}
