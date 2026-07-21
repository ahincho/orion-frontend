import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';
import type { DistribuidorZona } from '../../../core/types/assignment.types';

interface ListResponse<T> {
  readonly total: number;
  readonly items: readonly T[];
}

export class DistributorsApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  list(): Observable<Result<ListResponse<DistribuidorZona>>> {
    return this.client.get<ListResponse<DistribuidorZona>>(
      '/api/v1/asignacion-rutas/distribuidores',
    );
  }
}

export function injectDistributorsApi(): DistributorsApi {
  return new DistributorsApi(inject(HttpClient));
}
