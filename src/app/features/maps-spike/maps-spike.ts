import type {
  OnDestroy} from '@angular/core';
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
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';

import {
  MapShellComponent,
  createMarker,
} from '../../core/maps';

const OPENFREEMAP_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';
const LIMA_LNG = -77.05;
const LIMA_LAT = -12.06;
const LIMA_ZOOM = 11;

@Component({
  selector: 'orion-maps-spike',
  imports: [MapShellComponent],
  templateUrl: './maps-spike.html',
  styleUrl: './maps-spike.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsSpike implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly mapShell = viewChild.required<MapShellComponent>('mapShell');

  protected readonly styleUrl = signal(OPENFREEMAP_LIBERTY);
  protected readonly lng = signal(LIMA_LNG);
  protected readonly lat = signal(LIMA_LAT);
  protected readonly zoom = signal(LIMA_ZOOM);

  protected readonly center = computed<[number, number]>(() => [
    this.lng(),
    this.lat(),
  ]);
  protected readonly lngLabel = computed(() => this.lng().toFixed(6));
  protected readonly latLabel = computed(() => this.lat().toFixed(6));
  protected readonly zoomLabel = computed(() => this.zoom().toFixed(2));

  private marker: Marker | undefined;
  private moveendAttached = false;

  constructor() {
    effect(() => {
      const map = this.mapShell().ready();
      if (map && !this.marker) {
        this.attachMarker(map);
      }
    });
  }

  ngOnDestroy(): void {
    this.marker?.remove();
    this.marker = undefined;
  }

  protected reset(): void {
    this.lng.set(LIMA_LNG);
    this.lat.set(LIMA_LAT);
    this.zoom.set(LIMA_ZOOM);
  }

  protected onMapReady(map: MapLibreMap): void {
    if (!this.marker) {
      this.attachMarker(map);
    }
    if (this.moveendAttached) {
      return;
    }
    this.moveendAttached = true;
    map.on('moveend', () => {
      const center = map.getCenter();
      this.lng.set(center.lng);
      this.lat.set(center.lat);
      this.zoom.set(map.getZoom());
    });
  }

  private attachMarker(map: MapLibreMap): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.marker = createMarker({
      lngLat: [this.lng(), this.lat()],
      color: '#ef4444',
      draggable: true,
    }).addTo(map);

    this.marker.on('dragend', () => {
      const ll = this.marker?.getLngLat();
      if (!ll) {
        return;
      }
      this.lng.set(ll.lng);
      this.lat.set(ll.lat);
    });
  }
}
