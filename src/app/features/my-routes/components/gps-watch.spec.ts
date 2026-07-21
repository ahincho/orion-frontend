import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { GpsWatch } from './gps-watch';
import { FakeTranslateService } from '../../../core/i18n/fake-translate';
import type { LngLat } from '../../../core/types/geo.types';

interface GeoPosition {
  readonly coords: {
    readonly longitude: number;
    readonly latitude: number;
    readonly heading: number | null;
    readonly accuracy: number;
    readonly altitude: null;
    readonly altitudeAccuracy: null;
    readonly speed: null;
  };
  readonly timestamp: number;
}

function buildPosition(position: {
  lng: number;
  lat: number;
  heading: number;
}): GeoPosition {
  return {
    coords: {
      longitude: position.lng,
      latitude: position.lat,
      heading: position.heading,
      accuracy: 5,
      altitude: null,
      altitudeAccuracy: null,
      speed: null,
    },
    timestamp: Date.now(),
  } as unknown as GeoPosition;
}

function installGeolocationMock(): {
  emitSuccess(position: { lng: number; lat: number; heading: number }): void;
  emitError(message: string): void;
} {
  let currentSuccess: ((p: GeoPosition) => void) | undefined;
  let currentError: ((e: Error) => void) | undefined;

  Object.defineProperty(navigator, 'geolocation', {
    configurable: true,
    value: {
      watchPosition(success: (p: GeoPosition) => void, error?: (e: Error) => void) {
        currentSuccess = success;
        currentError = error;
        return 1;
      },
      clearWatch() {
        currentSuccess = undefined;
        currentError = undefined;
      },
    },
  });

  return {
    emitSuccess(position: { lng: number; lat: number; heading: number }) {
      if (currentSuccess) {
        currentSuccess(buildPosition(position));
      }
    },
    emitError(message: string) {
      if (currentError) {
        currentError(new Error(message));
      }
    },
  };
}

describe('GpsWatch', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GpsWatch, TranslatePipe],
      providers: [{ provide: TranslateService, useClass: FakeTranslateService }],
    });
  });

  it('emits locationUpdate when geolocation reports a position', () => {
    const handle = installGeolocationMock();
    const fixture = TestBed.createComponent(GpsWatch);
    fixture.detectChanges();

    let emitted: LngLat | null = null;
    fixture.componentInstance.locationUpdate.subscribe((coords) => {
      emitted = coords;
    });

    const startButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.gps-watch__start');
    expect(startButton).toBeTruthy();
    startButton?.click();
    fixture.detectChanges();
    handle.emitSuccess({ lng: -77.043, lat: -12.092, heading: 45 });

    expect(emitted).toEqual([-77.043, -12.092]);
    expect(fixture.componentInstance.headingDegrees()).toBe(45);
    expect(fixture.componentInstance.isWatching()).toBe(true);

    fixture.detectChanges();
    const stopButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.gps-watch__stop');
    stopButton?.click();
    expect(fixture.componentInstance.isWatching()).toBe(false);
  });

  it('emits errorUpdate when the browser does not support geolocation', () => {
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });
    const fixture = TestBed.createComponent(GpsWatch);
    fixture.detectChanges();

    let errorMsg: string | null = null;
    fixture.componentInstance.errorUpdate.subscribe((message) => {
      errorMsg = message;
    });

    const startButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.gps-watch__start');
    startButton?.click();

    expect(errorMsg).toBe('Geolocation no disponible.');
    expect(fixture.componentInstance.isWatching()).toBe(false);
  });
});
