import type { Feature, Point, Polygon } from 'geojson';

import type { LngLat } from './geo.types';
import type { Technology } from './technology.types';

export interface DailySummary {
  readonly fecha: string;
  readonly totalHogares: number;
  readonly hogaresCompletados: number;
  readonly hogaresPendientes: number;
  readonly porcentajeAvance: number;
  readonly tecnologia: Technology;
}

export interface VendorSurvey {
  readonly id: string;
  readonly hogarId: string;
  readonly direccion: string;
  readonly tecnologia: Technology;
  readonly estado:
    | 'pendiente'
    | 'en-progreso'
    | 'completado'
    | 'rechazado'
    | 'no-aplica';
  readonly notas: string | null;
  readonly ventanaHoraria: string;
  readonly coordenadas: LngLat;
}

export interface WeeklyAssignment {
  readonly fecha: string;
  readonly poligonoId: string;
  readonly poligonoNombre: string;
  readonly poligonoTecnologia: Technology;
  readonly hogares: number;
  readonly completado: boolean;
  readonly geometria: Feature<Polygon>;
  readonly puntoAcceso: Feature<Point>;
  readonly vendors: readonly VendorSurvey[];
}

export interface WeeklyRoutesResponse {
  readonly usuarioId: string;
  readonly generadoEn: string;
  readonly resumen: readonly DailySummary[];
  readonly asignaciones: readonly WeeklyAssignment[];
}
