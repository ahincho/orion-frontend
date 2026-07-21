import { describe, it, expect } from 'vitest';
import maplibregl from 'maplibre-gl';

import { createMarker } from './create-marker';

describe('createMarker', () => {
  it('returns a configured Marker instance with the requested lng/lat', () => {
    const marker = createMarker({
      lngLat: [-77.05, -12.06],
      color: '#ef4444',
      draggable: true,
    });
    expect(marker).toBeInstanceOf(maplibregl.Marker);
    const ll = marker.getLngLat();
    expect(ll.lng).toBeCloseTo(-77.05, 5);
    expect(ll.lat).toBeCloseTo(-12.06, 5);
    expect(marker.isDraggable()).toBe(true);
  });

  it('supports a custom HTML element', () => {
    const element = document.createElement('div');
    element.dataset['role'] = 'test-marker';
    const marker = createMarker({
      lngLat: [-77.05, -12.06],
      element,
    });
    expect(marker.getElement()).toBe(element);
  });
});
