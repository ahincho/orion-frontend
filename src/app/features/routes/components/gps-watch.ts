import { Component, DestroyRef, PLATFORM_ID, inject, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'orion-gps-watch',
  templateUrl: './gps-watch.html',
  host: { class: 'block' },
  imports: [TranslatePipe],
})
export class GpsWatch {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly locationUpdate = output<[number, number]>();
  readonly errorUpdate = output<string>();

  readonly isWatching = signal<boolean>(false);
  readonly currentPosition = signal<[number, number] | null>(null);
  readonly headingDegrees = signal<number>(0);

  private watchId: number | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.stopWatching());
  }

  protected startWatching(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const geo = navigator.geolocation;
    if (!geo) {
      this.errorUpdate.emit('Geolocation no disponible.');
      return;
    }
    this.watchId = geo.watchPosition(
      (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        this.currentPosition.set(coords);
        this.headingDegrees.set(position.coords.heading ?? this.headingDegrees());
        this.locationUpdate.emit(coords);
      },
      (cause) => {
        this.errorUpdate.emit(
          cause instanceof Error ? cause.message : 'No se pudo leer la posición.',
        );
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
    this.isWatching.set(true);
  }

  protected stopWatching(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching.set(false);
  }
}
