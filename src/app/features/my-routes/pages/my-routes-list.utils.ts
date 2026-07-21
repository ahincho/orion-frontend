import type { Feature, Point, Polygon } from 'geojson';

import type { WeeklyAssignment } from '../../../core/types/my-routes.types';

export interface RenderableAssignment {
  readonly id: string;
  readonly fecha: string;
  readonly polygonFeature: Feature<Polygon>;
  readonly pointFeature: Feature<Point>;
  readonly summary: string;
}

export function buildRenderableAssignments(
  assignments: readonly WeeklyAssignment[],
): RenderableAssignment[] {
  return assignments.map((assignment) => ({
    id: `${assignment.fecha}-${assignment.poligonoId}`,
    fecha: assignment.fecha,
    polygonFeature: assignment.geometria,
    pointFeature: assignment.puntoAcceso,
    summary: `${assignment.poligonoNombre} · ${assignment.hogares} hogares`,
  }));
}

export function formatDateLabel(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('es-PE', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });
}
