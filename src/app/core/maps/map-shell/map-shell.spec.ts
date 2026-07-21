import { TestBed } from '@angular/core/testing';

import { MapShellComponent } from './map-shell';

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

describe('MapShellComponent', () => {
  let restoreWebGL: () => void;

  beforeEach(() => {
    restoreWebGL = disableWebGL();
  });

  afterEach(() => {
    restoreWebGL();
  });

  it('exposes the expected initial signals before mounting', () => {
    TestBed.configureTestingModule({ imports: [MapShellComponent] });
    const fixture = TestBed.createComponent(MapShellComponent);
    const component = fixture.componentInstance;
    expect(component.status()).toBe('idle');
    expect(component.map()).toBeUndefined();
    expect(component.center()).toEqual([-77.05, -12.06]);
    expect(component.zoom()).toBe(11);
  });

  it('skips cleanly when WebGL is unavailable', () => {
    TestBed.configureTestingModule({ imports: [MapShellComponent] });
    const fixture = TestBed.createComponent(MapShellComponent);
    fixture.componentRef.setInput('styleUrl', 'https://example.test/style.json');
    fixture.detectChanges();
    expect(fixture.componentInstance.status()).toBe('error');
    expect(fixture.componentInstance.map()).toBeUndefined();
  });
});
