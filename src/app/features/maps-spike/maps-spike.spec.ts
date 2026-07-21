import { TestBed } from '@angular/core/testing';

import { MapsSpike } from './maps-spike';

describe('MapsSpike', () => {
  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
  });

  it('creates the component with idle status and Lima defaults', () => {
    TestBed.configureTestingModule({ imports: [MapsSpike] });
    const fixture = TestBed.createComponent(MapsSpike);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component['status']()).toBe('idle');
    expect(component['lng']()).toBeCloseTo(-77.05, 6);
    expect(component['lat']()).toBeCloseTo(-12.06, 6);
    expect(component['zoom']()).toBe(11);
  });

  it('formats coordinates with six-digit precision via computed labels', () => {
    TestBed.configureTestingModule({ imports: [MapsSpike] });
    const fixture = TestBed.createComponent(MapsSpike);
    const component = fixture.componentInstance;

    component['lng'].set(-77.123456789);
    component['lat'].set(-12.987654321);
    component['zoom'].set(14.5678);

    expect(component['lngLabel']()).toBe('-77.123457');
    expect(component['latLabel']()).toBe('-12.987654');
    expect(component['zoomLabel']()).toBe('14.57');
  });
});
