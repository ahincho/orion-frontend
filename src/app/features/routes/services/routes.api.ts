import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';
import type { WeeklyRoutesResponse } from '../../../core/types/routes.types';

export class RoutesApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  week(): Observable<Result<WeeklyRoutesResponse>> {
    return this.client.get<WeeklyRoutesResponse>('/api/v1/routes');
  }
}

export function injectRoutesApi(): RoutesApi {
  return new RoutesApi(inject(HttpClient));
}
