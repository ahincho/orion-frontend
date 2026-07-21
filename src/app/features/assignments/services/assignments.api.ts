import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';

export interface CreateAssignmentBatchRequest {
  readonly poligonos: readonly string[];
  readonly supervisorId: string;
  readonly distribuidorId: string;
  readonly fechaProgramada: string;
  readonly duracionEstimadaMin: number;
  readonly nota: string | null;
}

export interface CreateAssignmentBatchResponse {
  readonly status: 'created';
  readonly batch: {
    readonly id: string;
    readonly poligonos: readonly string[];
    readonly supervisorId: string;
    readonly distribuidorId: string;
    readonly fechaProgramada: string;
    readonly fechaCreacion: string;
    readonly duracionEstimadaMin: number;
    readonly nota: string | null;
  };
  readonly total: number;
}

export class AssignmentsApi {
  private readonly client: HttpResultClient;

  constructor(http: HttpClient) {
    this.client = new HttpResultClient(http);
  }

  createBatch(
    request: CreateAssignmentBatchRequest,
  ): Observable<Result<CreateAssignmentBatchResponse>> {
    return this.client.post<
      CreateAssignmentBatchRequest,
      CreateAssignmentBatchResponse
    >('/api/v1/assignments', request);
  }
}

export function injectAssignmentsApi(): AssignmentsApi {
  return new AssignmentsApi(inject(HttpClient));
}
