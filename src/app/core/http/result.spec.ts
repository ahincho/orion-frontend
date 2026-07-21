import { describe, it, expect } from 'vitest';

import {
  ok,
  fail,
  isSuccess,
  isFailure,
  type Result,
} from './result';

describe('Result', () => {
  it('builds a success wrapping the provided data', () => {
    const result = ok({ id: 7 });
    expect(isSuccess(result)).toBe(true);
    expect(isFailure(result)).toBe(false);
    if (isSuccess(result)) {
      expect(result.data).toEqual({ id: 7 });
    }
  });

  it('builds a failure with a code, message and optional cause', () => {
    const cause = new Error('boom');
    const result = fail('network', 'no route to host', cause);
    expect(isSuccess(result)).toBe(false);
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.code).toBe('network');
      expect(result.message).toBe('no route to host');
      expect(result.cause).toBe(cause);
    }
  });

  it('narrows via the predicate helpers', () => {
    function unwrap<T>(value: Result<T>): T | null {
      return isSuccess(value) ? value.data : null;
    }
    expect(unwrap(ok('hello'))).toBe('hello');
    expect(unwrap(fail('unknown', 'fail'))).toBeNull();
  });
});
