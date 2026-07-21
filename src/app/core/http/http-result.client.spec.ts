import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { HttpResultClient, failureFromError } from './http-result.client';
import { isSuccess, isFailure } from './result';

describe('HttpResultClient', () => {
  let controller: HttpTestingController;
  let client: HttpResultClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([])),
        provideHttpClientTesting(),
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    client = new HttpResultClient(TestBed.inject(HttpClient));
  });

  it('lifts a successful GET into a success Result', async () => {
    const request$ = client.get<{ ok: boolean }>('/api/v1/example');
    const promise = firstValueFrom(request$);
    const req = controller.expectOne('/api/v1/example');
    expect(req.request.method).toBe('GET');
    req.flush({ ok: true });
    const result = await promise;
    expect(isSuccess(result)).toBe(true);
    if (isSuccess(result)) {
      expect(result.data.ok).toBe(true);
    }
  });

  it('returns a 404 failure Result without throwing', async () => {
    const request$ = client.get<unknown>('/api/v1/missing');
    const promise = firstValueFrom(request$);
    const req = controller.expectOne('/api/v1/missing');
    req.flush('Not found', { status: 404, statusText: 'Not Found' });
    const result = await promise;
    expect(isFailure(result)).toBe(true);
    if (isFailure(result)) {
      expect(result.code).toBe('not_found');
    }
  });

  it('forwards query params', () => {
    const request$ = client.get<unknown>('/api/v1/search', {
      params: { q: 'lima', limit: 10 },
    });
    const promise = firstValueFrom(request$);
    const req = controller.expectOne(
      (r) => r.url === '/api/v1/search' && r.params.get('q') === 'lima',
    );
    expect(req.request.params.get('limit')).toBe('10');
    req.flush({ items: [] });
    return promise;
  });

  it('serializes POST bodies', async () => {
    const request$ = client.post<{ a: number }, { b: number }>('/api/v1/post', {
      a: 1,
    });
    const promise = firstValueFrom(request$);
    const req = controller.expectOne('/api/v1/post');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ a: 1 });
    req.flush({ b: 2 });
    await promise;
  });
});

describe('failureFromError', () => {
  it('maps unknown errors to the unknown code', () => {
    const result = failureFromError(new Error('boom'));
    expect(result.status).toBe('failure');
    if (result.status === 'failure') {
      expect(result.code).toBe('unknown');
    }
  });

  it('maps status 0 to network', () => {
    const result = failureFromError({ status: 0 });
    if (result.status === 'failure') {
      expect(result.code).toBe('network');
    }
  });
});
