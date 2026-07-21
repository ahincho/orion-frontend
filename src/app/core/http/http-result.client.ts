import { HttpParams } from '@angular/common/http';
import type { HttpClient } from '@angular/common/http';
import type { Observable, OperatorFunction } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

import { fail, isSuccess, ok, type Result } from './result';

/**
 * Thin wrapper around `HttpClient` that lifts every response into a
 * `Result<T>` discriminated union. The HttpClient still throws on network
 * errors; the wrapper converts those to `Result` failures so callers can
 * consume a single observable stream without try/catch around templates.
 */
export class HttpResultClient {
  constructor(private readonly http: HttpClient) {}

  get<T>(
    url: string,
    options: { params?: Record<string, string | number | boolean> } = {},
  ): Observable<Result<T>> {
    return this.request<T>('GET', url, undefined, options);
  }

  post<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<Result<TResponse>> {
    return this.request<TResponse>('POST', url, body);
  }

  put<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<Result<TResponse>> {
    return this.request<TResponse>('PUT', url, body);
  }

  patch<TRequest, TResponse>(
    url: string,
    body: TRequest,
  ): Observable<Result<TResponse>> {
    return this.request<TResponse>('PATCH', url, body);
  }

  delete<T>(url: string): Observable<Result<T>> {
    return this.request<T>('DELETE', url);
  }

  private request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    body?: unknown,
    options: { params?: Record<string, string | number | boolean> } = {},
  ): Observable<Result<T>> {
    let params: HttpParams = new HttpParams();
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        params = params.set(key, String(value));
      }
    }
    const stream = this.http.request<T>(method, url, {
      body,
      params,
      observe: 'body',
      responseType: 'json',
    });
    return stream.pipe(
      map((payload: T) => ok(payload) as Result<T>),
      catchError((cause: unknown) => of(failureFromError(cause) as Result<T>)),
    );
  }
}

export function failureFromError(cause: unknown): Result<never> {
  if (
    cause !== null &&
    typeof cause === 'object' &&
    'status' in cause &&
    typeof (cause as { status?: unknown }).status === 'number'
  ) {
    const status = (cause as { status: number }).status;
    if (status === 0) {
      return fail('network', 'Network unreachable', cause);
    }
    if (status === 401) {
      return fail('unauthorized', 'Authentication required', cause);
    }
    if (status === 403) {
      return fail('forbidden', 'Access denied', cause);
    }
    if (status === 404) {
      return fail('not_found', 'Resource not found', cause);
    }
    if (status === 409) {
      return fail('conflict', 'Conflict detected', cause);
    }
    if (status === 422) {
      return fail('validation', 'Invalid input', cause);
    }
    if (status >= 500) {
      return fail('server', `Server error (${status})`, cause);
    }
  }
  return fail('unknown', 'Unexpected error', cause);
}

export function unwrapResult<T>(): OperatorFunction<Result<T>, T> {
  return (source$) =>
    source$.pipe(
      map((result) => {
        if (isSuccess(result)) {
          return result.data;
        }
        throw new Error(result.message);
      }),
    );
}
