export type UserRole = 'asesor' | 'supervisor' | 'admin';

export interface User {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface LoginRequest {
  readonly email: string;
  readonly password: string;
}

export interface AuthResponse {
  readonly user: User;
  readonly token: string;
  readonly expiresAt: number;
}
