import type { Feature, Point, Polygon } from 'geojson';

import type { LngLat } from './geo.types';
import type { Technology } from './technology.types';

export interface DailySummary {
  readonly date: string;
  readonly totalHouseholds: number;
  readonly householdsCompleted: number;
  readonly householdsPending: number;
  readonly progressPercent: number;
  readonly technology: Technology;
}

export interface VendorSurvey {
  readonly id: string;
  readonly homeId: string;
  readonly address: string;
  readonly technology: Technology;
  readonly status:
    | 'pending'
    | 'in-progress'
    | 'completed'
    | 'rejected'
    | 'not-applicable';
  readonly notes: string | null;
  readonly timeWindow: string;
  readonly coordinates: LngLat;
}

export interface WeeklyAssignment {
  readonly date: string;
  readonly polygonId: string;
  readonly polygonName: string;
  readonly polygonTechnology: Technology;
  readonly households: number;
  readonly completed: boolean;
  readonly geometry: Feature<Polygon>;
  readonly accessPoint: Feature<Point>;
  readonly vendors: readonly VendorSurvey[];
}

export interface WeeklyRoutesResponse {
  readonly userId: string;
  readonly generatedAt: string;
  readonly summary: readonly DailySummary[];
  readonly assignments: readonly WeeklyAssignment[];
}
