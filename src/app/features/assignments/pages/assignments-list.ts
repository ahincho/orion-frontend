import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
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
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

import { MapShellComponent } from '../../../core/maps/map-shell/map-shell';
import { GeoJsonLayerComponent } from '../../../core/maps/geojson-layer/geojson-layer';
import { isValidPolygon } from '../../../core/types/geo.utils';
import { isSuccess } from '../../../core/http/result';

import { PolygonInfoModal } from '../components/polygon-info-modal';
import {
  ConfirmModal,
  type ConfirmAssignmentContext,
} from '../components/confirm-modal';
import {
  resolvePolygonStyle,
  readPolygonPropertyId,
} from '../../../core/maps/polygon-style.fn';

import { injectPolygonsApi } from '../services/polygons.api';
import { injectDistributorsApi } from '../services/distributors.api';
import { injectSupervisorsApi } from '../services/supervisors.api';
import { injectAssignmentsApi } from '../services/assignments.api';

import type {
  AssignmentByDay,
  PolygonInfoGeneral,
} from '../../../core/types/assignment.types';
import type {
  DistribuidorZona,
  Supervisor,
} from '../../../core/types/assignment.types';
import type { Feature, Geometry } from 'geojson';

const INITIAL_CENTER: [number, number] = [-77.043, -12.092];
const INITIAL_ZOOM = 11.5;
const FREE_MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

@Component({
  selector: 'orion-assignments-list',
  templateUrl: './assignments-list.html',
  styleUrl: './assignments-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MapShellComponent,
    GeoJsonLayerComponent,
    PolygonInfoModal,
    ConfirmModal,
    TranslatePipe,
  ],
})
export class AssignmentsList {
  private readonly polygonsApi = injectPolygonsApi();
  private readonly distributorsApi = injectDistributorsApi();
  private readonly supervisorsApi = injectSupervisorsApi();
  private readonly assignmentsApi = injectAssignmentsApi();
  private readonly platformId = inject(PLATFORM_ID);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly styleUrl = signal<string>(FREE_MAP_STYLE);
  readonly center = signal<[number, number]>(INITIAL_CENTER);
  readonly zoom = signal<number>(INITIAL_ZOOM);

  readonly polygonsResult = toSignal(this.polygonsApi.list(), {
    initialValue: undefined,
  });
  readonly distributorsResult = toSignal(this.distributorsApi.list(), {
    initialValue: undefined,
  });

  readonly supervisorQuery = signal<string>('');

  private readonly supervisorSearch$ = toObservable(this.supervisorQuery).pipe(
    debounceTime(150),
    distinctUntilChanged(),
    switchMap((query) => this.supervisorsApi.search({ q: query })),
  );
  readonly supervisorsResult = toSignal(this.supervisorSearch$, {
    initialValue: undefined,
  });

  readonly polygons = computed<readonly PolygonInfoGeneral[]>(() => {
    const result = this.polygonsResult();
    return result && isSuccess(result) ? result.data.properties : [];
  });

  readonly featureCollection = computed(() => {
    const result = this.polygonsResult();
    if (!result || !isSuccess(result)) {
      return undefined;
    }
    const fc = {
      type: 'FeatureCollection' as const,
      features: result.data.features.map((feature) => ({
        ...feature,
        properties: { ...(feature.properties ?? {}) },
      })) as Feature<Geometry>[],
    };
    return fc;
  });

  readonly invalidGeometryCount = computed<number>(() => {
    const result = this.polygonsResult();
    if (!result || !isSuccess(result)) {
      return 0;
    }
    return result.data.features.filter(
      (feature) => !isValidPolygon(feature).ok,
    ).length;
  });

  readonly distributors = computed<readonly DistribuidorZona[]>(() => {
    const result = this.distributorsResult();
    return result && isSuccess(result) ? result.data.items : [];
  });

  readonly supervisors = computed<readonly Supervisor[]>(() => {
    const result = this.supervisorsResult();
    return result && isSuccess(result) ? result.data.items : [];
  });

  readonly status = computed<'loading' | 'ready' | 'error'>(() => {
    const polygons = this.polygonsResult();
    if (!polygons) {
      return 'loading';
    }
    return polygons.status === 'success' ? 'ready' : 'error';
  });

  readonly selectedPolygon = signal<PolygonInfoGeneral | null>(null);
  readonly selectedSupervisorId = signal<string | null>(null);
  readonly selectedDistributorId = signal<string | null>(null);
  readonly scheduledDate = signal<string>(todayIsoDate());
  readonly durationMinutes = signal<number>(120);
  readonly note = signal<string>('');
  readonly isConfirming = signal<boolean>(false);
  readonly isSubmitting = signal<boolean>(false);
  readonly feedbackMessage = signal<string | null>(null);

  readonly canConfirmAssignment = computed(() => Boolean(
    this.selectedPolygon() &&
    this.selectedSupervisorId() &&
    this.selectedDistributorId(),
  ));

  readonly confirmContext = computed<ConfirmAssignmentContext | null>(() => {
    const polygon = this.selectedPolygon();
    if (!polygon) {
      return null;
    }
    const supervisor = this.supervisors().find(
      (entry) => entry.id === this.selectedSupervisorId(),
    );
    const distributor = this.distributors().find(
      (entry) => entry.id === this.selectedDistributorId(),
    );
    if (!supervisor || !distributor) {
      return null;
    }
    return {
      polygon,
      supervisorId: supervisor.id,
      supervisorName: supervisor.fullName,
      distributorId: distributor.id,
      distributorName: distributor.name,
      scheduledDate: this.scheduledDate(),
      estimatedDurationMin: this.durationMinutes(),
      note: this.note().trim() === '' ? null : this.note().trim(),
    };
  });

  private readonly activePolygonId = signal<string | null>(null);

  readonly summary = computed<AssignmentByDay[]>(() => {
    return this.polygons().map((polygon) => ({
      date: this.scheduledDate(),
      assignedPolygons: polygon.id === this.activePolygonId() ? 1 : 0,
      assignedHouseholds:
        polygon.id === this.activePolygonId() ? polygon.totalHouseholds : 0,
      progressPercent:
        polygon.id === this.activePolygonId()
          ? Math.round(
              (polygon.householdsWithService / polygon.totalHouseholds) * 100,
            )
          : 0,
    }));
  });

  readonly mapShellRef = viewChild<MapShellComponent>('mapShell');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      (window as { __ORION_MOCK_BACKEND__?: boolean }).__ORION_MOCK_BACKEND__ = true;
    }

    effect(() => {
      const distributors = this.distributors();
      if (distributors.length > 0 && this.selectedDistributorId() === null) {
        this.selectedDistributorId.set(distributors[0].id);
      }
    });
  }

  protected readonly polygonStyleFn = (feature: Feature<Geometry>) =>
    resolvePolygonStyle(feature);

  protected getInputValue(event: Event): string {
    const target = event.target as HTMLInputElement | null;
    return target?.value ?? '';
  }

  protected getSelectValue(event: Event): string {
    const target = event.target as HTMLSelectElement | null;
    return target?.value ?? '';
  }

  protected onPolygonClick(feature: Feature<Geometry>): void {
    const polygonId = readPolygonPropertyId(feature);
    if (!polygonId) {
      return;
    }
    const info = this.polygons().find((entry) => entry.id === polygonId);
    if (info) {
      this.selectedPolygon.set(info);
    }
  }

  protected closePolygonModal(): void {
    this.selectedPolygon.set(null);
  }

  protected startConfirm(): void {
    const polygon = this.selectedPolygon();
    if (polygon) {
      this.activePolygonId.set(polygon.id);
    }
    this.selectedPolygon.set(null);
    this.isConfirming.set(true);
  }

  protected cancelConfirm(): void {
    this.isConfirming.set(false);
    this.note.set('');
  }

  protected onSupervisorSearch(value: string): void {
    this.supervisorQuery.set(value);
  }

  protected onSelectSupervisor(supervisorId: string): void {
    this.selectedSupervisorId.set(supervisorId);
    this.supervisorQuery.set('');
  }

  protected onSelectDistributor(distribuidorId: string): void {
    this.selectedDistributorId.set(distribuidorId);
  }

  protected onDateChange(value: string): void {
    if (value) {
      this.scheduledDate.set(value);
    }
  }

  protected onDurationChange(value: string): void {
    const next = Number(value);
    if (Number.isFinite(next) && next > 0) {
      this.durationMinutes.set(next);
    }
  }

  protected onNoteChange(value: string): void {
    this.note.set(value);
  }

  protected async submitAssignment(): Promise<void> {
    const context = this.confirmContext();
    if (!context || this.isSubmitting()) {
      return;
    }
    this.isSubmitting.set(true);
    try {
      const response = await firstValueFrom(
        this.assignmentsApi.createBatch({
          polygons: [context.polygon.id],
          supervisorId: context.supervisorId,
          distributorId: context.distributorId,
          scheduledDate: context.scheduledDate,
          estimatedDurationMin: context.estimatedDurationMin,
          note: context.note,
        }),
      );
      if (!isSuccess(response)) {
        this.feedbackMessage.set(`Error: ${response.message}`);
        return;
      }
      this.feedbackMessage.set(
        `Asignación creada (${response.data.batch.id})`,
      );
      this.isConfirming.set(false);
      this.note.set('');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstValueFrom<T>(
  source: Observable<T>,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const subscription = source.subscribe({
      next: (value) => {
        subscription.unsubscribe();
        resolve(value);
      },
      error: (cause) => {
        subscription.unsubscribe();
        reject(cause);
      },
    });
  });
}
