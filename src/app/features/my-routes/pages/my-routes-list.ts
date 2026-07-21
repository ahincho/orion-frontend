import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';

import { MapShellComponent } from '../../../core/maps/map-shell/map-shell';
import { GeoJsonLayerComponent } from '../../../core/maps/geojson-layer/geojson-layer';
import { isPointInsidePolygon } from '../../../core/types/geo.utils';
import {
  classificationColor,
  type ClassificationKey,
} from '../../../core/types/classification.types';
import { isSuccess } from '../../../core/http/result';

import { injectMyRoutesApi } from '../services/my-routes.api';
import { DayCarousel, type DayCarouselItem } from '../components/day-carousel';
import { GpsWatch } from '../components/gps-watch';
import {
  buildRenderableAssignments,
  formatDateLabel,
} from './my-routes-list.utils';

import type {
  WeeklyAssignment,
  WeeklyRoutesResponse,
} from '../../../core/types/my-routes.types';
import type { LngLat } from '../../../core/types/geo.types';
import type { Feature, Geometry } from 'geojson';

const INITIAL_CENTER: [number, number] = [-77.043, -12.092];
const INITIAL_ZOOM = 11.5;
const FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

@Component({
  selector: 'orion-my-routes-list',
  templateUrl: './my-routes-list.html',
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MapShellComponent,
    GeoJsonLayerComponent,
    DayCarousel,
    GpsWatch,
    TranslatePipe,
  ],
})
export class MyRoutesList {
  private readonly myRoutesApi = injectMyRoutesApi();
  private readonly platformId = inject(PLATFORM_ID);

  readonly styleUrl = signal<string>(FREE_MAP_STYLE);
  readonly center = signal<[number, number]>(INITIAL_CENTER);
  readonly zoom = signal<number>(INITIAL_ZOOM);

  readonly weeklyResult = toSignal(this.myRoutesApi.week(), {
    initialValue: undefined,
  });

  readonly response = computed<WeeklyRoutesResponse | null>(() => {
    const result = this.weeklyResult();
    return result && isSuccess(result) ? result.data : null;
  });

  readonly status = computed<'loading' | 'ready' | 'error'>(() => {
    const result = this.weeklyResult();
    if (!result) {
      return 'loading';
    }
    return result.status === 'success' ? 'ready' : 'error';
  });

  readonly selectedDate = signal<string | null>(null);

  readonly selectedAssignment = computed<WeeklyAssignment | null>(() => {
    const response = this.response();
    if (!response) {
      return null;
    }
    const date = this.selectedDate();
    const list = response.assignments;
    if (!date) {
      return list[0] ?? null;
    }
    return list.find((entry) => entry.date === date) ?? null;
  });

  readonly renderableAssignments = computed(() =>
    buildRenderableAssignments(this.response()?.assignments ?? []),
  );

  readonly days = computed<readonly DayCarouselItem[]>(() => {
    const response = this.response();
    if (!response) {
      return [];
    }
    return response.assignments.map((assignment) => ({
      fecha: assignment.date,
      label: formatDateLabel(assignment.date),
      summary:
        response.summary.find((entry) => entry.date === assignment.date) ??
        null,
      assignmentId: assignment.polygonId,
    }));
  });

  readonly featureCollection = computed(() => {
    const assignment = this.selectedAssignment();
    if (!assignment) {
      return undefined;
    }
    return {
      type: 'FeatureCollection' as const,
      features: [assignment.geometry as Feature<Geometry>],
    };
  });

  readonly renderableAssignment = computed(() => {
    const assignment = this.selectedAssignment();
    if (!assignment) {
      return null;
    }
    return {
      id: `${assignment.date}-${assignment.polygonId}`,
      date: assignment.date,
      polygonFeature: assignment.geometry,
      pointFeature: assignment.accessPoint,
      summary: `${assignment.polygonName} · ${assignment.households} hogares`,
    };
  });

  readonly userMarker = signal<[number, number] | null>(null);
  readonly validationIssue = signal<string | null>(null);
  readonly validationSource = signal<'user' | 'point' | null>(null);

  readonly polygonClassificationFn = (
    classification: ClassificationKey | null,
  ) => classificationColor(classification);

  readonly polygonStyleFn = () => ({
    fill: '#6366f1',
    fillOpacity: 0.35,
    stroke: '#312e81',
    strokeWidth: 2,
  });

  readonly mapShellRef = viewChild<MapShellComponent>('mapShell');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      (window as { __ORION_MOCK_BACKEND__?: boolean }).__ORION_MOCK_BACKEND__ = true;
    }

    effect(() => {
      const response = this.response();
      if (response && this.selectedDate() === null) {
        const first = response.assignments[0];
        if (first) {
          this.selectedDate.set(first.date);
        }
      }
    });
  }

  protected onPickDay(date: string): void {
    this.selectedDate.set(date);
  }

  protected onUserLocation(coords: LngLat): void {
    this.userMarker.set(coords);
    this.validatePosition(coords, 'user');
  }

  protected onGpsError(message: string): void {
    this.validationIssue.set(message);
  }

  private validatePosition(coords: LngLat, source: 'user' | 'point'): void {
    const assignment = this.selectedAssignment();
    if (!assignment) {
      this.validationIssue.set(null);
      this.validationSource.set(null);
      return;
    }
    const inside = isPointInsidePolygon(coords, assignment.geometry);
    if (inside) {
      this.validationIssue.set(null);
      this.validationSource.set(null);
      return;
    }
    this.validationIssue.set('Punto fuera del poligono asignado.');
    this.validationSource.set(source);
  }
}
