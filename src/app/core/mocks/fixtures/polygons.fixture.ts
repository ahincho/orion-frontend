import type { PolygonGeoJsonData, PolygonInfoGeneral } from '../../../core/types/assignment.types';
import { classificationColor } from '../../../core/types/classification.types';
import type { Feature, Polygon } from 'geojson';

/**
 * Builds a 4-vertex closed ring centered on [lng, lat] with the given
 * half-size in degrees. Used to keep the fixture polygons compact and
 * readable. The starting point is duplicated at the end so the ring is
 * already closed.
 */
function square(lng: number, lat: number, half: number): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [lng - half, lat - half],
          [lng + half, lat - half],
          [lng + half, lat + half],
          [lng - half, lat + half],
          [lng - half, lat - half],
        ],
      ],
    },
  };
}

export const POLYGON_FIXTURES: readonly PolygonInfoGeneral[] = [
  {
    id: 'pol-lima-miraflores',
    code: 'LIM-MIR-001',
    name: 'Miraflores Centro',
    technology: 'GPON',
    classification: 'A',
    status: 'active',
    totalHouseholds: 1840,
    householdsWithService: 1620,
    householdsWithoutService: 220,
    lastAssignmentDate: '2026-07-12',
  },
  {
    id: 'pol-lima-surco',
    code: 'LIM-SUR-002',
    name: 'Surco Residencial',
    technology: 'HFC',
    classification: 'B',
    status: 'active',
    totalHouseholds: 1280,
    householdsWithService: 980,
    householdsWithoutService: 300,
    lastAssignmentDate: '2026-07-10',
  },
  {
    id: 'pol-lima-sanisidro',
    code: 'LIM-SIS-003',
    name: 'San Isidro Empresarial',
    technology: 'GPON',
    classification: 'A',
    status: 'active',
    totalHouseholds: 920,
    householdsWithService: 880,
    householdsWithoutService: 40,
    lastAssignmentDate: '2026-07-14',
  },
  {
    id: 'pol-lima-lince',
    code: 'LIM-LIN-004',
    name: 'Lince Mixto',
    technology: 'COPPER',
    classification: 'C',
    status: 'pending',
    totalHouseholds: 760,
    householdsWithService: 410,
    householdsWithoutService: 350,
    lastAssignmentDate: null,
  },
  {
    id: 'pol-lima-pueblolibre',
    code: 'LIM-PLB-005',
    name: 'Pueblo Libre',
    technology: 'HFC',
    classification: 'B',
    status: 'active',
    totalHouseholds: 1050,
    householdsWithService: 720,
    householdsWithoutService: 330,
    lastAssignmentDate: '2026-07-08',
  },
  {
    id: 'pol-lima-breña',
    code: 'LIM-BRE-006',
    name: 'Breña Central',
    technology: 'COPPER',
    classification: 'far',
    status: 'archived',
    totalHouseholds: 540,
    householdsWithService: 380,
    householdsWithoutService: 160,
    lastAssignmentDate: '2026-06-30',
  },
] as const;

const POLYGON_CENTERS: Readonly<Record<string, [number, number]>> = {
  'pol-lima-miraflores': [-77.028, -12.119],
  'pol-lima-surco': [-76.995, -12.135],
  'pol-lima-sanisidro': [-77.034, -12.094],
  'pol-lima-lince': [-77.032, -12.083],
  'pol-lima-pueblolibre': [-77.062, -12.077],
  'pol-lima-breña': [-77.057, -12.058],
};

const POLYGON_RADIUS: Readonly<Record<string, number>> = {
  'pol-lima-miraflores': 0.012,
  'pol-lima-surco': 0.01,
  'pol-lima-sanisidro': 0.008,
  'pol-lima-lince': 0.007,
  'pol-lima-pueblolibre': 0.009,
  'pol-lima-breña': 0.006,
};

export const POLYGON_GEOJSON_FIXTURE: PolygonGeoJsonData = (() => {
  const features: Feature<Polygon>[] = POLYGON_FIXTURES.map((info) => {
    const center = POLYGON_CENTERS[info.id] ?? [-77.05, -12.06];
    const half = POLYGON_RADIUS[info.id] ?? 0.005;
    const feature = square(center[0], center[1], half);
    const color = classificationColor(info.classification);
    return {
      ...feature,
      id: info.id,
      properties: {
        id: info.id,
        code: info.code,
        name: info.name,
        technology: info.technology,
        classification: info.classification,
        status: info.status,
        fill: color.fill,
        stroke: color.stroke,
      },
    };
  });
  return {
    type: 'FeatureCollection',
    features,
    properties: POLYGON_FIXTURES,
  };
})();

/**
 * Returns a GeoJSON FeatureCollection suitable for handing to the
 * GeoJsonLayerComponent. The properties bag carries the styling hints so
 * the layer can color polygons without an extra round trip.
 */
export function polygonsFeatureCollection(): {
  type: 'FeatureCollection';
  features: Feature<Polygon>[];
} {
  return {
    type: 'FeatureCollection',
    features: POLYGON_GEOJSON_FIXTURE.features.map((feature) => ({
      ...feature,
      properties: { ...(feature.properties ?? {}) },
    })),
  };
}
