import type { Feature, Point, Polygon } from 'geojson';

import type { WeeklyAssignment } from '../../../core/types/routes.types';

export interface RenderableAssignment {
  readonly id: string;
  readonly date: string;
  readonly polygonFeature: Feature<Polygon>;
  readonly pointFeature: Feature<Point>;
  readonly summary: string;
}

export function buildRenderableAssignments(
  assignments: readonly WeeklyAssignment[],
): RenderableAssignment[] {
  return assignments.map((assignment) => ({
    id: `${assignment.date}-${assignment.polygonId}`,
    date: assignment.date,
    polygonFeature: assignment.geometry,
    pointFeature: assignment.accessPoint,
    summary: `${assignment.polygonName} · ${assignment.households} hogares`,
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
