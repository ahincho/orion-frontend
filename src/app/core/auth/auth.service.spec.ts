import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth.service';
import { MOCK_CREDENTIALS } from './auth.mocks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start unauthenticated', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
  });

  it('should authenticate a valid mock credential', async () => {
    const credential = MOCK_CREDENTIALS[0];
    const response = await firstValueFrom(
      service.login({ email: credential.email, password: credential.password }),
    );
    expect(response.user.id).toBe(credential.user.id);
    expect(response.token).toBeTruthy();
    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe(credential.email);
  });

  it('should reject an invalid credential', async () => {
    await expect(
      firstValueFrom(
        service.login({ email: 'wrong@orion.com', password: 'badpass' }),
      ),
    ).rejects.toThrow(/Credenciales inválidas/);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear the session on logout', async () => {
    const credential = MOCK_CREDENTIALS[0];
    await firstValueFrom(
      service.login({ email: credential.email, password: credential.password }),
    );
    expect(service.isAuthenticated()).toBe(true);
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(service.token()).toBeNull();
  });
});