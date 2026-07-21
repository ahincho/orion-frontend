import { TestBed } from '@angular/core/testing';

import { GeoJsonLayerComponent } from './geojson-layer';

describe('GeoJsonLayerComponent', () => {
  it('builds deterministic layer IDs that derive from the user-provided prefix', () => {
    TestBed.configureTestingModule({ imports: [GeoJsonLayerComponent] });
    const fixture = TestBed.createComponent(GeoJsonLayerComponent);
    const component = fixture.componentInstance;

    expect(component['sourceId']()).toBe('orion-geojson-source');
    expect(component['fillLayerId']()).toBe('orion-geojson-fill');
    expect(component['lineLayerId']()).toBe('orion-geojson-line');

    fixture.componentRef.setInput('id', 'asignaciones');
    expect(component['sourceId']()).toBe('asignaciones-source');
    expect(component['fillLayerId']()).toBe('asignaciones-fill');
    expect(component['lineLayerId']()).toBe('asignaciones-line');
  });

  it('propagates paint inputs as defaults before a Map is attached', () => {
    TestBed.configureTestingModule({ imports: [GeoJsonLayerComponent] });
    const fixture = TestBed.createComponent(GeoJsonLayerComponent);
    fixture.componentRef.setInput('fillColor', '#ff0000');
    fixture.componentRef.setInput('fillOpacity', 0.5);
    fixture.componentRef.setInput('strokeWidth', 3);
    const component = fixture.componentInstance;

    expect(component.fillColor()).toBe('#ff0000');
    expect(component.fillOpacity()).toBe(0.5);
    expect(component.strokeWidth()).toBe(3);
  });
});
