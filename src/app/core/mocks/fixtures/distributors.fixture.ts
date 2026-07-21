import type { DistribuidorZona } from '../../../core/types/assignment.types';

export const DISTRIBUTOR_FIXTURES: readonly DistribuidorZona[] = [
  {
    id: 'dist-lima-norte',
    nombre: 'Lima Norte',
    codigoSap: 'D-001',
    zonas: ['Lince', 'Breña', 'Pueblo Libre'],
    coordinador: 'Carlos Quispe',
    activo: true,
  },
  {
    id: 'dist-lima-centro',
    nombre: 'Lima Centro',
    codigoSap: 'D-002',
    zonas: ['Miraflores', 'San Isidro'],
    coordinador: 'Patricia Ramirez',
    activo: true,
  },
  {
    id: 'dist-lima-este',
    nombre: 'Lima Este',
    codigoSap: 'D-003',
    zonas: ['Surco', 'La Molina'],
    coordinador: 'Jorge Mendoza',
    activo: true,
  },
] as const;
