import type { Feature, Geometry, Point } from 'geojson';

export interface VendorMarkerEntry {
  readonly id: string;
  readonly coordinates: [number, number];
  readonly label: string;
  readonly completed: boolean;
}

export function buildVendorMarkers(point: Feature<Point> | undefined): VendorMarkerEntry[] {
  if (!point) {
    return [];
  }
  return [
    {
      id: 'access-point',
      coordinates: point.geometry.coordinates as [number, number],
      label: 'Punto de acceso',
      completed: true,
    },
  ];
}

export function readVendorTooltip(feature: Feature<Geometry>): string | null {
  const tooltip = feature.properties;
  if (tooltip === null || typeof tooltip !== 'object') {
    return null;
  }
  const tooltipText = (tooltip as { tooltip?: unknown }).tooltip;
  return typeof tooltipText === 'string' ? tooltipText : null;
}
