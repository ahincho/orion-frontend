import type { Feature, Point, Polygon } from 'geojson';

import type {
  WeeklyRoutesResponse,
  WeeklyAssignment,
  DailySummary,
  VendorSurvey,
} from '../../../core/types/routes.types';
import { POLYGON_FIXTURES } from './polygons.fixture';

const DEFAULT_USER_ID = 'vendor-001';
const TODAY = new Date();

function isoDay(offsetDays: number): string {
  const date = new Date(TODAY);
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function squareAround(center: [number, number], half: number): Feature<Polygon> {
  const [lng, lat] = center;
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

function accessPoint(center: [number, number]): Feature<Point> {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: center,
    },
  };
}

function vendorFor(
  index: number,
  polygonId: string,
  center: [number, number],
  technology: 'GPON' | 'HFC' | 'COPPER',
  offset: number,
): VendorSurvey {
  return {
    id: `vendor-${polygonId}-${index}`,
    homeId: `home-${polygonId}-${index}`,
    address: `Calle ${index + 100}, Lima`,
    technology,
    status: index === 0 ? 'completed' : 'pending',
    notes: null,
    timeWindow: '08:00 - 12:00',
    coordinates: [center[0] + offset * 0.002, center[1] + (offset % 2 === 0 ? 0.001 : -0.001)],
  };
}

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

function buildWeeklyAssignment(
  polygonId: string,
  offsetDays: number,
  vendorCount: number,
  center: [number, number],
): WeeklyAssignment {
  const polygon = POLYGON_FIXTURES.find((entry) => entry.id === polygonId);
  if (!polygon) {
    throw new Error(`polygon fixture missing: ${polygonId}`);
  }
  const radius = POLYGON_RADIUS[polygonId] ?? 0.005;
  const vendors: VendorSurvey[] = [];
  for (let i = 0; i < vendorCount; i += 1) {
    vendors.push(vendorFor(i, polygonId, center, polygon.technology, i));
  }
  return {
    date: isoDay(offsetDays),
    polygonId,
    polygonName: polygon.name,
    polygonTechnology: polygon.technology,
    households: polygon.totalHouseholds,
    completed: vendors.every((vendor) => vendor.status === 'completed'),
    geometry: squareAround(center, radius),
    accessPoint: accessPoint(center),
    vendors,
  };
}

function buildDailySummary(polygonId: string, offsetDays: number): DailySummary {
  const polygon = POLYGON_FIXTURES.find((entry) => entry.id === polygonId);
  if (!polygon) {
    throw new Error(`polygon fixture missing: ${polygonId}`);
  }
  const completionRatio =
    polygon.id === 'pol-lima-miraflores'
      ? 1
      : polygon.id === 'pol-lima-sanisidro'
        ? 0.95
        : polygon.id === 'pol-lima-breña'
          ? 0.7
          : 0;
  const completed = Math.round(polygon.totalHouseholds * completionRatio);
  return {
    date: isoDay(offsetDays),
    totalHouseholds: polygon.totalHouseholds,
    householdsCompleted: completed,
    householdsPending: polygon.totalHouseholds - completed,
    progressPercent: Math.round(completionRatio * 100),
    technology: polygon.technology,
  };
}

const ROTATION: readonly { polygonId: string; offsetDays: number }[] = [
  { polygonId: 'pol-lima-miraflores', offsetDays: 0 },
  { polygonId: 'pol-lima-surco', offsetDays: 1 },
  { polygonId: 'pol-lima-sanisidro', offsetDays: 2 },
  { polygonId: 'pol-lima-lince', offsetDays: 3 },
  { polygonId: 'pol-lima-pueblolibre', offsetDays: 4 },
  { polygonId: 'pol-lima-breña', offsetDays: 5 },
  { polygonId: 'pol-lima-miraflores', offsetDays: 6 },
];

const WEEKLY_ASSIGNMENTS: readonly WeeklyAssignment[] = ROTATION.map(
  ({ polygonId, offsetDays }) => {
    const center = POLYGON_CENTERS[polygonId] ?? [-77.05, -12.06];
    return buildWeeklyAssignment(polygonId, offsetDays, 4, center);
  },
);

const DAILY_SUMMARIES: readonly DailySummary[] = ROTATION.map(({ polygonId, offsetDays }) =>
  buildDailySummary(polygonId, offsetDays),
);

export const ROUTES_FIXTURE: WeeklyRoutesResponse = {
  userId: DEFAULT_USER_ID,
  generatedAt: TODAY.toISOString(),
  summary: DAILY_SUMMARIES,
  assignments: WEEKLY_ASSIGNMENTS,
};
