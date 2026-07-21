import { describe, it, expect } from 'vitest';
import { gzipSync, strToU8 } from 'fflate';

import {
  decompressBase64Gzip,
  GzipDecodeError,
  describeGzipError,
} from './gzip.util';

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte ?? 0);
  }
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function gzipJson<T>(payload: T): string {
  return toBase64(gzipSync(strToU8(JSON.stringify(payload))));
}

describe('gzip.util', () => {
  it('round-trips a JSON payload through gzip+base64', () => {
    const encoded = gzipJson({ hello: 'world', n: 42 });
    const decoded = decompressBase64Gzip<{ hello: string; n: number }>(encoded);
    expect(decoded).toEqual({ hello: 'world', n: 42 });
  });

  it('round-trips a deeply nested GeoJSON-shaped payload', () => {
    interface Deep {
      polygon: {
        type: 'FeatureCollection';
        features: {
          type: 'Feature';
          geometry: { type: 'Polygon'; coordinates: number[][][] };
          properties: { id: string };
        }[];
      };
    }
    const encoded = gzipJson<Deep>({
      polygon: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [-77.05, -12.06],
                  [-77.04, -12.06],
                  [-77.04, -12.05],
                  [-77.05, -12.05],
                  [-77.05, -12.06],
                ],
              ],
            },
            properties: { id: 'LIMA-001' },
          },
        ],
      },
    });
    const decoded = decompressBase64Gzip<Deep>(encoded);
    expect(decoded.polygon.features[0]?.properties.id).toBe('LIMA-001');
  });

  it('throws GzipDecodeError on invalid base64', () => {
    expect(() => decompressBase64Gzip('@@@not-base64@@@')).toThrow(GzipDecodeError);
  });

  it('throws GzipDecodeError on valid base64 but invalid gzip bytes', () => {
    const junk = toBase64(new Uint8Array([1, 2, 3, 4, 5, 6]));
    expect(() => decompressBase64Gzip(junk)).toThrow(GzipDecodeError);
  });

  it('throws GzipDecodeError on valid gzip but invalid JSON', () => {
    const bytes = gzipSync(strToU8('not-json'));
    const b64 = toBase64(bytes);
    expect(() => decompressBase64Gzip(b64)).toThrow(GzipDecodeError);
  });

  it('describeGzipError reports context for each error shape', () => {
    expect(describeGzipError(new GzipDecodeError('ctx'))).toContain('ctx');
    expect(describeGzipError(new Error('boom'))).toBe('unknown gzip error');
  });

  it('exposes the gzip magic bytes through the public base64 helper', () => {
    const encoded = gzipJson({ a: 1 });
    const bytes = fromBase64(encoded);
    expect(bytes[0]).toBe(0x1f);
    expect(bytes[1]).toBe(0x8b);
  });
});
