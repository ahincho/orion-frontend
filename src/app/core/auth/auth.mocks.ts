import type { User } from './auth.types';

interface MockCredential {
  readonly email: string;
  readonly password: string;
  readonly user: User;
}

export const MOCK_CREDENTIALS: readonly MockCredential[] = [
  {
    email: 'demo@orion.com',
    password: 'orion123',
    user: {
      id: 'u-001',
      email: 'demo@orion.com',
      name: 'Asesor Demo',
      role: 'asesor',
    },
  },
  {
    email: 'supervisor@orion.com',
    password: 'orion123',
    user: {
      id: 'u-002',
      email: 'supervisor@orion.com',
      name: 'Marta Rivas',
      role: 'supervisor',
    },
  },
  {
    email: 'admin@orion.com',
    password: 'orion123',
    user: {
      id: 'u-003',
      email: 'admin@orion.com',
      name: 'Carlos Mendoza',
      role: 'admin',
    },
  },
] as const;
