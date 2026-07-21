import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';
import type { Supervisor } from '../../../core/types/assignment.types';

interface ListResponse<T> {
  readonly total: number;
  readonly items: readonly T[];
}

export interface SupervisorSearchQuery {
  readonly q?: string;
}

export class SupervisorsApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  search(
    query: SupervisorSearchQuery = {},
  ): Observable<Result<ListResponse<Supervisor>>> {
    return this.client.get<ListResponse<Supervisor>>(
      '/api/v1/asignacion-rutas/supervisores',
      {
        params: query.q ? { q: query.q } : {},
      },
    );
  }
}

export function injectSupervisorsApi(): SupervisorsApi {
  return new SupervisorsApi(inject(HttpClient));
}
