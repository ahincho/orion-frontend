import type { Feature, Polygon } from 'geojson';

import type { ClassificationKey } from './classification.types';
import type { LngLat } from './geo.types';
import type { Technology } from './technology.types';

export interface PolygonInfoGeneral {
  readonly id: string;
  readonly codigo: string;
  readonly nombre: string;
  readonly tecnologia: Technology;
  readonly clasificacion: ClassificationKey;
  readonly estado: 'active' | 'pending' | 'archived';
  readonly totalHogares: number;
  readonly hogaresConServicio: number;
  readonly hogaresSinServicio: number;
  readonly ultimaAsignacionFecha: string | null;
}

export interface DistribuidorZona {
  readonly id: string;
  readonly nombre: string;
  readonly codigoSap: string;
  readonly zonas: readonly string[];
  readonly coordinador: string;
  readonly activo: boolean;
}

export interface Supervisor {
  readonly id: string;
  readonly dni: string;
  readonly nombreCompleto: string;
  readonly email: string;
  readonly celular: string;
  readonly zonaAsignada: string;
  readonly distributors: readonly string[];
  readonly disponibilidad: 'available' | 'busy' | 'offline';
  readonly avatarUrl: string | null;
}

export interface PolygonGeoJsonData {
  readonly type: 'FeatureCollection';
  readonly features: readonly Feature<Polygon>[];
  readonly properties: readonly PolygonInfoGeneral[];
}

export interface AssignmentDraft {
  readonly polygonId: string;
  readonly supervisorId: string;
  readonly distribuidorId: string;
  readonly fechaProgramada: string;
  readonly duracionEstimadaMin: number;
  readonly nota: string | null;
}

export type AssignmentAvailability = 'available' | 'partial' | 'taken';

export interface AssignmentBatch {
  readonly id: string;
  readonly poligonos: readonly PolygonInfoGeneral[];
  readonly draft: AssignmentDraft;
  readonly centroside: LngLat;
  readonly fechaCreacion: string;
}

export interface AssignmentByDay {
  readonly fecha: string;
  readonly poligonosAsignados: number;
  readonly hogaresAsignados: number;
  readonly porcentajeAvance: number;
}
