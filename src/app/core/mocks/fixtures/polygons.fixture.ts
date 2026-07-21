import type {
  Polygon,
  Feature,
  FeatureCollection,
} from 'geojson';

import type {
  PolygonGeoJsonData,
  PolygonInfoGeneral,
} from '../../../core/types/assignment.types';
import { classificationColor } from '../../../core/types/classification.types';

/**
 * Builds a 4-vertex closed ring centered on [lng, lat] with the given
 * half-size in degrees. Used to keep the fixture polygons compact and
 * readable. The starting point is duplicated at the end so the ring is
 * already closed.
 */
function square(
  lng: number,
  lat: number,
  half: number,
): Feature<Polygon> {
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
    codigo: 'LIM-MIR-001',
    nombre: 'Miraflores Centro',
    tecnologia: 'GPON',
    clasificacion: 'A',
    estado: 'active',
    totalHogares: 1840,
    hogaresConServicio: 1620,
    hogaresSinServicio: 220,
    ultimaAsignacionFecha: '2026-07-12',
  },
  {
    id: 'pol-lima-surco',
    codigo: 'LIM-SUR-002',
    nombre: 'Surco Residencial',
    tecnologia: 'HFC',
    clasificacion: 'B',
    estado: 'active',
    totalHogares: 1280,
    hogaresConServicio: 980,
    hogaresSinServicio: 300,
    ultimaAsignacionFecha: '2026-07-10',
  },
  {
    id: 'pol-lima-sanisidro',
    codigo: 'LIM-SIS-003',
    nombre: 'San Isidro Empresarial',
    tecnologia: 'GPON',
    clasificacion: 'A',
    estado: 'active',
    totalHogares: 920,
    hogaresConServicio: 880,
    hogaresSinServicio: 40,
    ultimaAsignacionFecha: '2026-07-14',
  },
  {
    id: 'pol-lima-lince',
    codigo: 'LIM-LIN-004',
    nombre: 'Lince Mixto',
    tecnologia: 'COPPER',
    clasificacion: 'C',
    estado: 'pending',
    totalHogares: 760,
    hogaresConServicio: 410,
    hogaresSinServicio: 350,
    ultimaAsignacionFecha: null,
  },
  {
    id: 'pol-lima-pueblolibre',
    codigo: 'LIM-PLB-005',
    nombre: 'Pueblo Libre',
    tecnologia: 'HFC',
    clasificacion: 'B',
    estado: 'active',
    totalHogares: 1050,
    hogaresConServicio: 720,
    hogaresSinServicio: 330,
    ultimaAsignacionFecha: '2026-07-08',
  },
  {
    id: 'pol-lima-breña',
    codigo: 'LIM-BRE-006',
    nombre: 'Breña Central',
    tecnologia: 'COPPER',
    clasificacion: 'lejano',
    estado: 'archived',
    totalHogares: 540,
    hogaresConServicio: 380,
    hogaresSinServicio: 160,
    ultimaAsignacionFecha: '2026-06-30',
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
    const color = classificationColor(info.clasificacion);
    return {
      ...feature,
      id: info.id,
      properties: {
        id: info.id,
        codigo: info.codigo,
        nombre: info.nombre,
        tecnologia: info.tecnologia,
        clasificacion: info.clasificacion,
        estado: info.estado,
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
export function polygonsFeatureCollection(): FeatureCollection<Polygon> {
  return {
    type: 'FeatureCollection',
    features: POLYGON_GEOJSON_FIXTURE.features.map((feature) => ({
      ...feature,
      properties: { ...(feature.properties ?? {}) },
    })),
  };
}
