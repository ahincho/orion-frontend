import type { DistribuidorZona } from '../../../core/types/assignment.types';

export const DISTRIBUTOR_FIXTURES: readonly DistribuidorZona[] = [
  {
    id: 'dist-lima-norte',
    name: 'Lima Norte',
    sapCode: 'D-001',
    zones: ['Lince', 'Breña', 'Pueblo Libre'],
    coordinator: 'Carlos Quispe',
    active: true,
  },
  {
    id: 'dist-lima-centro',
    name: 'Lima Centro',
    sapCode: 'D-002',
    zones: ['Miraflores', 'San Isidro'],
    coordinator: 'Patricia Ramirez',
    active: true,
  },
  {
    id: 'dist-lima-este',
    name: 'Lima Este',
    sapCode: 'D-003',
    zones: ['Surco', 'La Molina'],
    coordinator: 'Jorge Mendoza',
    active: true,
  },
] as const;
