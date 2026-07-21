import { strFromU8, decompressSync } from 'fflate';

/**
 * Decodes a payload produced by the backend's gzip+base64 transport format:
 *
 *   { "<key>": "<base64-encoded gzip JSON>" }
 *
 * The string is decoded from base64, interpreted as a UTF-8 byte stream,
 * decompressed with the fastest decoder fflate exposes, and finally parsed
 * as JSON. Throws `GzipDecodeError` if any of those steps fail so callers
 * can convert the throw into a `Result` failure.
 */
export class GzipDecodeError extends Error {
  override readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GzipDecodeError';
    this.cause = cause;
  }
}

export function decompressBase64Gzip<T = unknown>(payload: string): T {
  let bytes: Uint8Array;
  try {
    bytes = base64ToBytes(payload);
  } catch (cause) {
    throw new GzipDecodeError('payload is not valid base64', cause);
  }
  let decompressed: Uint8Array;
  try {
    decompressed = decompressSync(bytes);
  } catch (cause) {
    throw new GzipDecodeError('payload is not valid gzip', cause);
  }
  try {
    return JSON.parse(strFromU8(decompressed)) as T;
  } catch (cause) {
    throw new GzipDecodeError('decompressed payload is not valid JSON', cause);
  }
}

function base64ToBytes(b64: string): Uint8Array {
  if (typeof atob !== 'function') {
    throw new GzipDecodeError('atob is not available in this environment');
  }
  let binary: string;
  try {
    binary = atob(b64);
  } catch (cause) {
    throw new GzipDecodeError('atob rejected the input', cause);
  }
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }
  return buffer;
}

/**
 * Wraps fflate's typed errors into a uniform shape so tests can assert without
 * having to import fflate's internal types.
 */
export function describeGzipError(error: unknown): string {
  if (error instanceof GzipDecodeError) {
    return error.message;
  }
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'number'
  ) {
    return `gzip error code=${(error as { code: number }).code}`;
  }
  return 'unknown gzip error';
}
