import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import maplibregl, { type Map, type Marker } from 'maplibre-gl';

const OPENFREEMAP_LIBERTY = 'https://tiles.openfreemap.org/styles/liberty';
const LIMA_LNG = -77.05;
const LIMA_LAT = -12.06;
const LIMA_ZOOM = 11;

@Component({
  selector: 'orion-maps-spike',
  imports: [],
  templateUrl: './maps-spike.html',
  styleUrl: './maps-spike.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsSpike implements AfterViewInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly hostRef = viewChild.required<ElementRef<HTMLDivElement>>('host');

  protected readonly status = signal<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  protected readonly lng = signal(LIMA_LNG);
  protected readonly lat = signal(LIMA_LAT);
  protected readonly zoom = signal(LIMA_ZOOM);

  protected readonly lngLabel = computed(() => this.lng().toFixed(6));
  protected readonly latLabel = computed(() => this.lat().toFixed(6));
  protected readonly zoomLabel = computed(() => this.zoom().toFixed(2));

  private map: Map | undefined;
  private marker: Marker | undefined;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.status.set('loading');

    try {
      this.map = new maplibregl.Map({
        container: this.hostRef().nativeElement,
        style: OPENFREEMAP_LIBERTY,
        center: [this.lng(), this.lat()],
        zoom: this.zoom(),
        attributionControl: { compact: true },
      });

      this.map.on('load', () => this.attachMarker());
      this.map.on('error', (event: unknown) => {
        console.error('[maps-spike] map error', event);
        this.status.set('error');
      });
    } catch (error) {
      console.error('[maps-spike] failed to initialize map', error);
      this.status.set('error');
    }
  }

  ngOnDestroy(): void {
    this.marker?.remove();
    this.marker = undefined;
    this.map?.remove();
    this.map = undefined;
  }

  protected reset(): void {
    if (!this.map) {
      return;
    }
    this.map.flyTo({ center: [LIMA_LNG, LIMA_LAT], zoom: LIMA_ZOOM });
    this.marker?.setLngLat([LIMA_LNG, LIMA_LAT]);
    this.lng.set(LIMA_LNG);
    this.lat.set(LIMA_LAT);
    this.zoom.set(LIMA_ZOOM);
  }

  private attachMarker(): void {
    if (!this.map) {
      return;
    }
    this.marker = new maplibregl.Marker({
      color: '#ef4444',
      draggable: true,
    })
      .setLngLat([this.lng(), this.lat()])
      .addTo(this.map);

    this.marker.on('dragend', () => {
      const ll = this.marker?.getLngLat();
      if (!ll) {
        return;
      }
      this.lng.set(ll.lng);
      this.lat.set(ll.lat);
    });

    this.map.on('moveend', () => {
      const c = this.map?.getCenter();
      if (!c) {
        return;
      }
      this.lng.set(c.lng);
      this.lat.set(c.lat);
      this.zoom.set(this.map?.getZoom() ?? LIMA_ZOOM);
    });

    this.status.set('ready');
  }
}
