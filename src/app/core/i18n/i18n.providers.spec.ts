import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { TranslateLoader, TranslateService } from '@ngx-translate/core';
import { describe, expect, it, vi } from 'vitest';

import { assetsTranslateLoader, provideI18n } from './i18n.providers';
import { LanguageService } from './language.service';
import { LOCALE_STORAGE_KEY } from './i18n.types';

class TrackingTranslateService {
  readonly useCalls: string[] = [];
  readonly addLangsCalls: readonly string[][] = [];

  instant(): string {
    return '';
  }
  use(language: string): Promise<unknown> {
    this.useCalls.push(language);
    return Promise.resolve();
  }
  addLangs(languages: readonly string[]): void {
    (this.addLangsCalls as string[][]).push([...languages]);
  }
}

describe('provideI18n', () => {
  beforeEach(() => {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it('does not throw NG0203 when assembled in a providers array', () => {
    expect(() =>
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideI18n(),
        ],
      }),
    ).not.toThrow();
  });

  it('passes the active LanguageService signal through to TranslateService.use', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n(),
        { provide: TranslateService, useClass: TrackingTranslateService },
      ],
    });

    const translate = TestBed.inject(TranslateService) as unknown as TrackingTranslateService;
    const language = TestBed.inject(LanguageService);

    await Promise.resolve();
    expect(translate.useCalls.at(-1)).toBe(language.current());
    expect(translate.addLangsCalls).toContainEqual(['es', 'en']);
  });

  it('honours a stored language preference', async () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideI18n(),
        { provide: TranslateService, useClass: TrackingTranslateService },
      ],
    });

    const translate = TestBed.inject(TranslateService) as unknown as TrackingTranslateService;
    const language = TestBed.inject(LanguageService);

    await Promise.resolve();
    expect(language.current()).toBe('en');
    expect(translate.useCalls.at(-1)).toBe('en');
  });

  it('resolves the assets loader through DI without throwing', () => {
    const fetchSpy = vi.fn(async () => new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchSpy);

    try {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideI18n()],
      });

      const loader = TestBed.inject(TranslateLoader);
      expect(typeof loader.getTranslation).toBe('function');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('assetsTranslateLoader returns a fresh loader that resolves from /assets/i18n/<lang>.json', async () => {
    const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      expect(url).toBe('/assets/i18n/en.json');
      return new Response(JSON.stringify({ 'hello': 'world' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    });
    vi.stubGlobal('fetch', fetchSpy);

    try {
      const loader = assetsTranslateLoader();
      const translations = await firstValueFrom(loader.getTranslation('en'));
      expect(translations).toEqual({ hello: 'world' });
      expect(fetchSpy).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
