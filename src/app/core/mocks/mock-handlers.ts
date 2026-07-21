import type { HttpRequest } from '@angular/common/http';

import {
  POLYGON_FIXTURES,
  polygonsFeatureCollection,
} from './fixtures/polygons.fixture';
import { DISTRIBUTOR_FIXTURES } from './fixtures/distributors.fixture';
import { SUPERVISOR_FIXTURES } from './fixtures/supervisors.fixture';
import { MY_ROUTES_FIXTURE } from './fixtures/my-routes.fixture';

/**
 * Single registry entry: every mock URL handler the front-end falls back to
 * when the real backend is not yet available or the user is in a preview
 * environment. PR-A scaffolds the registry; PR-D populates it with the
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

interface CreatedAssignmentBatch {
  readonly id: string;
  readonly poligonos: readonly string[];
  readonly supervisorId: string;
  readonly distribuidorId: string;
  readonly fechaProgramada: string;
  readonly fechaCreacion: string;
  readonly duracionEstimadaMin: number;
  readonly nota: string | null;
}

const storedAssignments: CreatedAssignmentBatch[] = [];

function readString(
  body: unknown,
  key: string,
): string | null {
  if (
    body !== null &&
    typeof body === 'object' &&
    key in (body as Record<string, unknown>)
  ) {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

function readNumber(
  body: unknown,
  key: string,
): number | null {
  if (
    body !== null &&
    typeof body === 'object' &&
    key in (body as Record<string, unknown>)
  ) {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === 'number' ? value : null;
  }
  return null;
}

/**
 * Order matters: the first matching handler wins. Handlers registering the
 * `assignments` endpoints are inserted FIRST so they win against the
 * default fallback (still empty here, but reserved for future flows).
 */
export const mockBackendHandlers: readonly MockBackendHandler[] = [
  {
    id: 'list-polygons',
    method: 'GET',
    matchKind: 'exact',
    pattern: '/api/v1/polygons',
    delayMs: 120,
    resolve: () => ({
      ...polygonsFeatureCollection(),
      total: POLYGON_FIXTURES.length,
    }),
  },
  {
    id: 'list-distributors',
    method: 'GET',
    matchKind: 'exact',
    pattern: '/api/v1/distributors',
    delayMs: 80,
    resolve: () => ({
      total: DISTRIBUTOR_FIXTURES.length,
      items: DISTRIBUTOR_FIXTURES,
    }),
  },
  {
    id: 'list-supervisors',
    method: 'GET',
    matchKind: 'prefix',
    pattern: '/api/v1/supervisors',
    delayMs: 80,
    resolve: (request) => {
      const query = request.params.get('q')?.trim().toLowerCase() ?? '';
      if (!query) {
        return {
          total: SUPERVISOR_FIXTURES.length,
          items: SUPERVISOR_FIXTURES,
        };
      }
      const filtered = SUPERVISOR_FIXTURES.filter(
        (entry) =>
          entry.nombreCompleto.toLowerCase().includes(query) ||
          entry.zonaAsignada.toLowerCase().includes(query) ||
          entry.dni.includes(query),
      );
      return {
        total: filtered.length,
        items: filtered,
      };
    },
  },
  {
    id: 'create-assignment',
    method: 'POST',
    matchKind: 'exact',
    pattern: '/api/v1/assignments',
    delayMs: 220,
    resolve: (request) => {
      const body = request.body as unknown;
      const id = `batch-${Date.now().toString(36)}`;
      const poligonos = Array.isArray(
        (body as { poligonos?: unknown }).poligonos,
      )
        ? ((body as { poligonos: unknown[] }).poligonos.filter(
            (id): id is string => typeof id === 'string',
          ))
        : [];
      const supervisorId = readString(body, 'supervisorId') ?? '';
      const distribuidorId = readString(body, 'distribuidorId') ?? '';
      const fechaProgramada =
        readString(body, 'fechaProgramada') ?? new Date().toISOString();
      const duracionEstimadaMin = readNumber(body, 'duracionEstimadaMin') ?? 0;
      const nota = readString(body, 'nota');
      const created: CreatedAssignmentBatch = {
        id,
        poligonos,
        supervisorId,
        distribuidorId,
        fechaProgramada,
        fechaCreacion: new Date().toISOString(),
        duracionEstimadaMin,
        nota,
      };
      storedAssignments.push(created);
      return {
        status: 'created',
        batch: created,
        total: storedAssignments.length,
      };
    },
  },
  {
    id: 'my-routes',
    method: 'GET',
    matchKind: 'exact',
    pattern: '/api/v1/my-routes',
    delayMs: 160,
    resolve: () => MY_ROUTES_FIXTURE,
  },
];
