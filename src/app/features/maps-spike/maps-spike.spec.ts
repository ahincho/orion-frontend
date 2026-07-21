import { TestBed } from '@angular/core/testing';

import { MapsSpike } from './maps-spike';

function disableWebGL(): () => void {
  const original = HTMLCanvasElement.prototype.getContext;
  const patched = function (
    this: HTMLCanvasElement,
    contextId: string,
    options?: unknown,
  ): ReturnType<typeof original> {
    if (contextId === 'webgl' || contextId === 'webgl2' || contextId === 'experimental-webgl') {
      return null;
    }
    if (original) {
      return original.call(this, contextId, options as never);
    }
    return null;
  };
  HTMLCanvasElement.prototype.getContext =
    patched as unknown as typeof HTMLCanvasElement.prototype.getContext;
  return () => {
    HTMLCanvasElement.prototype.getContext = original;
  };
}

describe('MapsSpike', () => {
  let restoreWebGL: () => void;

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      get: () => true,
    });
    restoreWebGL = disableWebGL();
  });

  afterEach(() => {
    restoreWebGL();
  });

  it('creates the component with Lima defaults through the embedded map shell', () => {
    TestBed.configureTestingModule({ imports: [MapsSpike] });
    const fixture = TestBed.createComponent(MapsSpike);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    expect(component['lng']()).toBeCloseTo(-77.05, 6);
    expect(component['lat']()).toBeCloseTo(-12.06, 6);
    expect(component['zoom']()).toBe(11);
    expect(component['styleUrl']()).toContain('openfreemap.org');
  });

  it('formats coordinates with six-digit precision', () => {
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

  it('reset() restores the Lima defaults', () => {
    TestBed.configureTestingModule({ imports: [MapsSpike] });
    const fixture = TestBed.createComponent(MapsSpike);
    const component = fixture.componentInstance;

    component['lng'].set(-50);
    component['lat'].set(0);
    component['zoom'].set(2);

    component['reset']();

    expect(component['lng']()).toBeCloseTo(-77.05, 6);
    expect(component['lat']()).toBeCloseTo(-12.06, 6);
    expect(component['zoom']()).toBe(11);
  });
});
