import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';
import type {
  PolygonGeoJsonData,
} from '../../../core/types/assignment.types';

interface ListResponse<T> {
  readonly total: number;
  readonly items: readonly T[];
}

/**
 * HTTP service for the polygon catalog. The real backend will return the
 * FeatureCollection plus the property lookup in a single payload so the
 * front-end can call it once per polygon assignment session.
 */
export class PolygonsApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  list(): Observable<Result<PolygonGeoJsonData>> {
    return this.client.get<PolygonGeoJsonData>('/api/v1/regional/poligonos');
  }
}

export function injectPolygonsApi(): PolygonsApi {
  return new PolygonsApi(inject(HttpClient));
}

export type { ListResponse };
