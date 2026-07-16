import { Injectable, signal } from '@angular/core';

import { THEME_STORAGE_KEY, type Theme } from './theme.types';

const isTheme = (value: unknown): value is Theme =>
  value === 'light' || value === 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private static readonly STORAGE = THEME_STORAGE_KEY;

  readonly theme = signal<Theme>(ThemeService.detectInitial());

  constructor() {
    ThemeService.applyToDocument(this.theme());
  }

  set(next: Theme): void {
    this.theme.set(next);
    ThemeService.applyToDocument(next);
    ThemeService.persist(next);
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private static detectInitial(): Theme {
    if (typeof localStorage === 'undefined') {
      return 'light';
    }
    const stored = localStorage.getItem(ThemeService.STORAGE);
    if (isTheme(stored)) {
      return stored;
    }
    if (
      typeof matchMedia === 'function' &&
      matchMedia('(prefers-color-scheme: dark)').matches
    ) {
      return 'dark';
    }
    return 'light';
  }

  private static applyToDocument(theme: Theme): void {
    if (typeof document === 'undefined') {
      return;
    }
    document.documentElement.setAttribute('data-theme', theme);
  }

  private static persist(theme: Theme): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      localStorage.setItem(ThemeService.STORAGE, theme);
    } catch {
      /* ignore quota / private-mode errors */
    }
  }
}