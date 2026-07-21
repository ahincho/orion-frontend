import { Injectable, computed, signal } from '@angular/core';
import type { Observable } from 'rxjs';
import { delay, of, tap, throwError } from 'rxjs';

import { MOCK_CREDENTIALS } from './auth.mocks';
import type { AuthResponse, LoginRequest, User } from './auth.types';

const STORAGE_KEY = 'orion.auth.session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly session = signal<AuthResponse | null>(null);

  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly token = computed<string | null>(() => this.session()?.token ?? null);
  readonly isAuthenticated = computed<boolean>(() => {
    const current = this.session();
    if (!current) {
      return false;
    }
    return current.expiresAt > Date.now();
  });

  constructor() {
    this.restoreFromStorage();
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    const match = MOCK_CREDENTIALS.find(
      (credential) =>
        credential.email === request.email &&
        credential.password === request.password,
    );

    if (!match) {
      return throwError(() => new Error('Credenciales inválidas. Verifique su correo y contraseña.')).pipe(
        delay(400),
      );
    }

    const response: AuthResponse = {
      user: match.user,
      token: this.fakeToken(match.user.id),
      expiresAt: Date.now() + SESSION_TTL_MS,
    };

    return of(response).pipe(
      delay(500),
      tap((res) => this.persist(res)),
    );
  }

  logout(): void {
    this.session.set(null);
    this.clearStorage();
  }

  private persist(response: AuthResponse): void {
    this.session.set(response);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response));
    } catch {
      // storage may be unavailable (e.g., private browsing) — non-fatal
    }
  }

  private restoreFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as AuthResponse;
      if (parsed.expiresAt <= Date.now()) {
        this.clearStorage();
        return;
      }
      this.session.set(parsed);
    } catch {
      this.clearStorage();
    }
  }

  private clearStorage(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // non-fatal
    }
  }

  private fakeToken(userId: string): string {
    const issuedAt = Date.now().toString(36);
    const nonce = Math.random().toString(36).slice(2, 10);
    return `mock.${userId}.${issuedAt}.${nonce}`;
  }
}
