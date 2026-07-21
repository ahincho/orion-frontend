/**
 * Discriminated union describing the outcome of an HTTP call. Keeps the
 * success/failure shape narrow enough to model every backend contract the
 * front-end consumes.
 */
export type Result<T> = ResultSuccess<T> | ResultFailure;

export interface ResultSuccess<T> {
  readonly status: 'success';
  readonly data: T;
}

export interface ResultFailure {
  readonly status: 'failure';
  readonly code: ResultErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}

export type ResultErrorCode =
  | 'network'
  | 'timeout'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'server'
  | 'decoding'
  | 'unknown';

export function ok<T>(data: T): Result<T> {
  return { status: 'success', data };
}

export function fail(
  code: ResultErrorCode,
  message: string,
  cause?: unknown,
): Result<never> {
  return { status: 'failure', code, message, cause };
}

export function isSuccess<T>(result: Result<T>): result is ResultSuccess<T> {
  return result.status === 'success';
}

export function isFailure<T>(result: Result<T>): result is ResultFailure {
  return result.status === 'failure';
}
