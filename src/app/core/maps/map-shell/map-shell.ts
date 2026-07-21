import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import {
  Component,
  PLATFORM_ID,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import maplibregl, {
  type LngLatBoundsLike,
  type LngLatLike,
  type Map as MapLibreMap,
} from 'maplibre-gl';

/**
 * Reusable host for any MapLibre GL JS map. The component owns the lifecycle
 * (instantiation, listeners cleanup, disposal) and exposes the live `Map`
 * instance through a signal so directives bound via content children can
 * react to it once it loads.
 *
 * Inputs are signals so consumers can drive them with computed values and
 * the map will follow. Each reactive input is mirrored onto the live map
 * through an effect, gated by `status === 'ready'`. The `interactive`
 * flag is consumed only at construction time because MapLibre 5 dropped
 * the runtime `setOptions` API.
 */
@Component({
  selector: 'orion-map-shell',
  templateUrl: './map-shell.html',
  host: { class: 'relative block h-full w-full min-h-60' },
})
export class MapShellComponent implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

  readonly styleUrl = input.required<string>();
  readonly center = input<LngLatLike>([-77.05, -12.06]);
  readonly zoom = input<number>(11);
  readonly maxBounds = input<LngLatBoundsLike | null>(null);
  readonly interactive = input<boolean>(true);
  readonly showAttribution = input<boolean>(true);

  readonly mapReady = output<MapLibreMap>();
  readonly mapError = output<unknown>();

  readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>('idle');
  readonly map = signal<MapLibreMap | undefined>(undefined);

  constructor() {
    effect(() => {
      const center = this.center();
      const map = this.map();
      if (map && this.status() === 'ready') {
        map.setCenter(center);
      }
    });
    effect(() => {
      const zoom = this.zoom();
      const map = this.map();
      if (map && this.status() === 'ready') {
        map.setZoom(zoom);
      }
    });
    effect(() => {
      const bounds = this.maxBounds();
      const map = this.map();
      if (map && this.status() === 'ready') {
        map.setMaxBounds(bounds ?? undefined);
      }
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.status.set('loading');

    try {
      const instance = new maplibregl.Map({
        container: this.hostRef().nativeElement,
        style: this.styleUrl(),
        center: this.center(),
        zoom: this.zoom(),
        maxBounds: this.maxBounds() ?? undefined,
        interactive: this.interactive(),
        attributionControl: this.showAttribution() ? { compact: true } : false,
      });

      instance.on('load', () => {
        this.map.set(instance);
        this.status.set('ready');
        this.mapReady.emit(instance);
      });

      instance.on('error', (event: unknown) => {
        console.error('[map-shell] map error', event);
        this.status.set('error');
        this.mapError.emit(event);
      });
    } catch (error) {
      console.error('[map-shell] failed to instantiate map', error);
      this.status.set('error');
      this.mapError.emit(error);
    }
  }

  ngOnDestroy(): void {
    this.map()?.remove();
    this.map.set(undefined);
  }

  /**
   * Returns a snapshot of the live MapLibre instance. Synchronous and
   * non-null only after the `'ready'` event has fired; consumers should
   * rely on the `mapReady` output rather than reading this directly.
   */
  ready(): MapLibreMap | undefined {
    return this.map();
  }
}
