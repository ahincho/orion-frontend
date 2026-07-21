import { Injectable, computed, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { DEFAULT_LANGUAGE, LOCALE_STORAGE_KEY, SUPPORTED_LANGUAGES, type Language } from './i18n.types';

/**
 * Reactive facade over `@ngx-translate/core`. Holds the active language in a
 * signal so templates, computed values and other services can react to a
 * locale switch without requiring a refresh.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly translate = inject(TranslateService);

  private readonly currentSignal = signal<Language>(this.resolveInitial());

  readonly current = this.currentSignal.asReadonly();
  readonly languages = computed<readonly Language[]>(() => SUPPORTED_LANGUAGES);

  constructor() {
    this.translate.addLangs([...SUPPORTED_LANGUAGES]);
    this.translate.use(this.currentSignal());
  }

  /**
   * Switches the active language at runtime. The choice is persisted in
   * `localStorage` so it survives page reloads.
   */
  setLanguage(language: Language): void {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
      return;
    }
    this.translate.use(language);
    this.currentSignal.set(language);
    this.persist(language);
  }

  /**
   * Returns the translation for the given key. Falls back to the key itself
   * if no translation exists, which keeps the UI readable during development.
   */
  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params);
  }

  private resolveInitial(): Language {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_LANGUAGE;
    }
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
    return DEFAULT_LANGUAGE;
  }

  private persist(language: Language): void {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(LOCALE_STORAGE_KEY, language);
  }
}
