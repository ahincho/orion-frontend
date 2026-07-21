import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';
import type { WeeklyRoutesResponse } from '../../../core/types/my-routes.types';

export class MyRoutesApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  week(): Observable<Result<WeeklyRoutesResponse>> {
    return this.client.get<WeeklyRoutesResponse>(
      '/api/v1/asignacion-rutas/mi-ruta',
    );
  }
}

export function injectMyRoutesApi(): MyRoutesApi {
  return new MyRoutesApi(inject(HttpClient));
}
