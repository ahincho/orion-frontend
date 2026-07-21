import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';

import { HttpResultClient } from '../../../core/http/http-result.client';
import type { Result } from '../../../core/http/result';

export interface CreateAssignmentBatchRequest {
  readonly polygons: readonly string[];
  readonly supervisorId: string;
  readonly distributorId: string;
  readonly scheduledDate: string;
  readonly estimatedDurationMin: number;
  readonly note: string | null;
}

export interface CreateAssignmentBatchResponse {
  readonly status: 'created';
  readonly batch: {
    readonly id: string;
    readonly polygons: readonly string[];
    readonly supervisorId: string;
    readonly distributorId: string;
    readonly scheduledDate: string;
    readonly createdAt: string;
    readonly estimatedDurationMin: number;
    readonly note: string | null;
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
