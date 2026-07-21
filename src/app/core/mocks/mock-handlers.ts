import type { HttpRequest } from '@angular/common/http';

import { POLYGON_FIXTURES, polygonsFeatureCollection } from './fixtures/polygons.fixture';
import { DISTRIBUTOR_FIXTURES } from './fixtures/distributors.fixture';
import { SUPERVISOR_FIXTURES } from './fixtures/supervisors.fixture';
import { ROUTES_FIXTURE } from './fixtures/routes.fixture';

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
  readonly polygons: readonly string[];
  readonly supervisorId: string;
  readonly distributorId: string;
  readonly scheduledDate: string;
  readonly createdAt: string;
  readonly estimatedDurationMin: number;
  readonly note: string | null;
}

const storedAssignments: CreatedAssignmentBatch[] = [];

function readString(body: unknown, key: string): string | null {
  if (body !== null && typeof body === 'object' && key in (body as Record<string, unknown>)) {
    const value = (body as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

function readNumber(body: unknown, key: string): number | null {
  if (body !== null && typeof body === 'object' && key in (body as Record<string, unknown>)) {
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
          entry.fullName.toLowerCase().includes(query) ||
          entry.assignedZone.toLowerCase().includes(query) ||
          entry.nationalId.includes(query),
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
      const polygons = Array.isArray((body as { polygons?: unknown }).polygons)
        ? (body as { polygons: unknown[] }).polygons.filter(
            (id): id is string => typeof id === 'string',
          )
        : [];
      const supervisorId = readString(body, 'supervisorId') ?? '';
      const distributorId = readString(body, 'distributorId') ?? '';
      const scheduledDate = readString(body, 'scheduledDate') ?? new Date().toISOString();
      const estimatedDurationMin = readNumber(body, 'estimatedDurationMin') ?? 0;
      const note = readString(body, 'note');
      const created: CreatedAssignmentBatch = {
        id,
        polygons,
        supervisorId,
        distributorId,
        scheduledDate,
        createdAt: new Date().toISOString(),
        estimatedDurationMin,
        note,
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
    id: 'routes',
    method: 'GET',
    matchKind: 'exact',
    pattern: '/api/v1/routes',
    delayMs: 160,
    resolve: () => ROUTES_FIXTURE,
  },
];
