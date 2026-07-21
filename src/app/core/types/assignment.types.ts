import type { Feature, Polygon } from 'geojson';

import type { ClassificationKey } from './classification.types';
import type { LngLat } from './geo.types';
import type { Technology } from './technology.types';

export interface PolygonInfoGeneral {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly technology: Technology;
  readonly classification: ClassificationKey;
  readonly status: 'active' | 'pending' | 'archived';
  readonly totalHouseholds: number;
  readonly householdsWithService: number;
  readonly householdsWithoutService: number;
  readonly lastAssignmentDate: string | null;
}

export interface DistribuidorZona {
  readonly id: string;
  readonly name: string;
  readonly sapCode: string;
  readonly zones: readonly string[];
  readonly coordinator: string;
  readonly active: boolean;
}

export interface Supervisor {
  readonly id: string;
  readonly nationalId: string;
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly assignedZone: string;
  readonly distributors: readonly string[];
  readonly availability: 'available' | 'busy' | 'offline';
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
  readonly distributorId: string;
  readonly scheduledDate: string;
  readonly estimatedDurationMin: number;
  readonly note: string | null;
}

export type AssignmentAvailability = 'available' | 'partial' | 'taken';

export interface AssignmentBatch {
  readonly id: string;
  readonly polygons: readonly PolygonInfoGeneral[];
  readonly draft: AssignmentDraft;
  readonly centroid: LngLat;
  readonly createdAt: string;
}

export interface AssignmentByDay {
  readonly date: string;
  readonly assignedPolygons: number;
  readonly assignedHouseholds: number;
  readonly progressPercent: number;
}
