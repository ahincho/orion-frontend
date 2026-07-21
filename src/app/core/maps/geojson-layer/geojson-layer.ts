import type { OnDestroy } from '@angular/core';
import { Component, computed, effect, input, output, signal } from '@angular/core';
import {
  type GeoJSONSource,
  type Map as MapLibreMap,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
} from 'maplibre-gl';
import type { Feature, FeatureCollection, Geometry } from 'geojson';

import type { GeoJsonInput, GeoJsonLayerStyle, GeoJsonLayerStyleFn } from '../map.types';

const DEFAULT_STYLE: Required<GeoJsonLayerStyle> = {
  fill: '#4f46e5',
  fillOpacity: 0.35,
  stroke: '#312e81',
  strokeWidth: 1.5,
  strokeOpacity: 1,
};

const DEFAULT_LAYER_PREFIX = 'orion-geojson';

/**
 * Component that owns a single GeoJSON source on a live MapLibre map. It
 * reacts to its inputs through effects: when a `map` instance and `data`
 * resolve together, a `geojson` source plus `fill`/`line` layers are
 * added (or updated if they already exist). Hover/click events on
 * rendered features bubble out via `featureHover` and `featureClick`
 * outputs.
 *
 * Consumers wire the component as a child of an `orion-map-shell` and
 * bind the parent map through a template reference:
 *
 * ```html
 * <orion-map-shell #shell ... />
 * <orion-geojson-layer [map]="shell.map()" [data]="features" />
 * ```
 */
@Component({
  selector: 'orion-geojson-layer',
  template: '',
})
export class GeoJsonLayerComponent implements OnDestroy {
  readonly map = input<MapLibreMap | undefined>(undefined);
  readonly data = input<GeoJsonInput>(null);
  readonly id = input<string>(DEFAULT_LAYER_PREFIX);
  readonly fillColor = input<string>(DEFAULT_STYLE.fill);
  readonly fillOpacity = input<number>(DEFAULT_STYLE.fillOpacity);
  readonly strokeColor = input<string>(DEFAULT_STYLE.stroke);
  readonly strokeWidth = input<number>(DEFAULT_STYLE.strokeWidth);
  readonly strokeOpacity = input<number>(DEFAULT_STYLE.strokeOpacity);
  readonly interactive = input<boolean>(true);
  readonly styleFn = input<GeoJsonLayerStyleFn | undefined>(undefined);

  readonly featureHover = output<Feature<Geometry> | null>();
  readonly featureClick = output<Feature<Geometry>>();

  protected readonly sourceId = computed(() => `${this.id()}-source`);
  protected readonly fillLayerId = computed(() => `${this.id()}-fill`);
  protected readonly lineLayerId = computed(() => `${this.id()}-line`);

  private readonly attachedMap = signal<MapLibreMap | undefined>(undefined);
  private readonly featureIndex = new FeatureIndex();
  private readonly syntheticIdCounter = { value: 0 };

  private hoverHandler: ((event: MapLayerMouseEvent) => void) | undefined;
  private leaveHandler: ((event: MapLayerMouseEvent) => void) | undefined;
  private clickHandler: ((event: MapLayerMouseEvent) => void) | undefined;

  constructor() {
    effect(() => {
      const map = this.map();
      const data = this.data();
      if (!map || !data) {
        return;
      }
      this.syncSource(map, data);
    });

    effect(() => {
      const map = this.map();
      const fill = this.fillLayerId();
      const fillColor = this.fillColor();
      const fillOpacity = this.fillOpacity();
      if (map && map.getLayer(fill)) {
        map.setPaintProperty(fill, 'fill-color', fillColor);
        map.setPaintProperty(fill, 'fill-opacity', fillOpacity);
      }
    });

    effect(() => {
      const map = this.map();
      const line = this.lineLayerId();
      const strokeColor = this.strokeColor();
      const strokeWidth = this.strokeWidth();
      const strokeOpacity = this.strokeOpacity();
      if (map && map.getLayer(line)) {
        map.setPaintProperty(line, 'line-color', strokeColor);
        map.setPaintProperty(line, 'line-width', strokeWidth);
        map.setPaintProperty(line, 'line-opacity', strokeOpacity);
      }
    });

    effect(() => {
      const map = this.map();
      const interactive = this.interactive();
      const fill = this.fillLayerId();
      if (!map) {
        return;
      }
      if (interactive) {
        this.bindInteractions(map, fill);
      } else {
        this.detachInteractions();
      }
    });
  }

  ngOnDestroy(): void {
    this.detachInteractions();
    const map = this.attachedMap();
    const sourceId = this.sourceId();
    const fill = this.fillLayerId();
    const line = this.lineLayerId();
    if (!map) {
      return;
    }
    if (map.getLayer(line)) {
      map.removeLayer(line);
    }
    if (map.getLayer(fill)) {
      map.removeLayer(fill);
    }
    const source = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (source) {
      map.removeSource(sourceId);
    }
  }

  /**
   * Returns the live computed style for a given feature if a `styleFn`
   * was provided. Useful for callers that need to resolve the same
   * color shown on the map (e.g. legend building).
   */
  resolveStyle(feature: Feature<Geometry>): GeoJsonLayerStyle | undefined {
    return this.styleFn()?.(feature);
  }

  private syncSource(map: MapLibreMap, data: NonNullable<GeoJsonInput>): void {
    const sourceId = this.sourceId();
    const fill = this.fillLayerId();
    const line = this.lineLayerId();
    const collection = normalizeToFeatureCollection(data);

    const existing = map.getSource(sourceId) as GeoJSONSource | undefined;
    if (existing) {
      existing.setData(collection);
      this.indexFeatures(collection.features);
      return;
    }
    this.attachedMap.set(map);
    map.addSource(sourceId, { type: 'geojson', data: collection });
    map.addLayer({
      id: fill,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': this.fillColor(),
        'fill-opacity': this.fillOpacity(),
      },
    });
    map.addLayer({
      id: line,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': this.strokeColor(),
        'line-width': this.strokeWidth(),
        'line-opacity': this.strokeOpacity(),
      },
    });
    this.indexFeatures(collection.features);
  }

  private indexFeatures(features: Feature<Geometry>[]): void {
    this.featureIndex.reset();
    for (const feature of features) {
      if (feature.id !== undefined) {
        this.featureIndex.add(String(feature.id), feature);
      } else {
        const syntheticId = `__synthetic_${++this.syntheticIdCounter.value}`;
        this.featureIndex.add(syntheticId, feature);
      }
    }
  }

  private bindInteractions(map: MapLibreMap, layerId: string): void {
    if (this.hoverHandler && this.clickHandler && this.leaveHandler) {
      return;
    }
    this.hoverHandler = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) {
        return;
      }
      this.featureHover.emit(toGeojsonFeature(feature));
    };
    this.leaveHandler = () => {
      this.featureHover.emit(null);
    };
    this.clickHandler = (event: MapLayerMouseEvent) => {
      const feature = event.features?.[0];
      if (!feature) {
        return;
      }
      this.featureClick.emit(toGeojsonFeature(feature));
    };
    map.on('mousemove', layerId, this.hoverHandler);
    map.on('mouseleave', layerId, this.leaveHandler);
    map.on('click', layerId, this.clickHandler);
  }

  private detachInteractions(): void {
    const map = this.attachedMap();
    const fill = this.fillLayerId();
    if (!map) {
      return;
    }
    if (this.hoverHandler) {
      map.off('mousemove', fill, this.hoverHandler);
      this.hoverHandler = undefined;
    }
    if (this.leaveHandler) {
      map.off('mouseleave', fill, this.leaveHandler);
      this.leaveHandler = undefined;
    }
    if (this.clickHandler) {
      map.off('click', fill, this.clickHandler);
      this.clickHandler = undefined;
    }
  }
}

class FeatureIndex {
  private readonly byKey = new Map<string, Feature<Geometry>>();

  reset(): void {
    this.byKey.clear();
  }

  add(key: string, feature: Feature<Geometry>): void {
    this.byKey.set(key, feature);
  }

  get(key: string): Feature<Geometry> | undefined {
    return this.byKey.get(key);
  }
}

function normalizeToFeatureCollection(
  input: NonNullable<GeoJsonInput>,
): FeatureCollection<Geometry> {
  if (Array.isArray(input)) {
    return { type: 'FeatureCollection', features: input };
  }
  if ('type' in input && input.type === 'FeatureCollection') {
    return input;
  }
  return { type: 'FeatureCollection', features: [input] };
}

function toGeojsonFeature(eventFeature: MapGeoJSONFeature): Feature<Geometry> {
  const geometry = eventFeature.geometry as Geometry;
  const properties = (eventFeature.properties ?? {}) as Record<string, unknown>;
  return {
    type: 'Feature',
    id: eventFeature.id,
    geometry,
    properties,
  };
}
