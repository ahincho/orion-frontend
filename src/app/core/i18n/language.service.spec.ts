import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { LanguageService } from './language.service';
import { LOCALE_STORAGE_KEY } from './i18n.types';

class FakeTranslateService {
  useCalls: string[] = [];
  addLangsCalls: string[] = [];

  instant(): string {
    return '';
  }

  use(language: string): Promise<unknown> {
    this.useCalls.push(language);
    return Promise.resolve();
  }

  addLangs(languages: readonly string[]): void {
    this.addLangsCalls.push(languages.join(','));
  }
}

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.removeItem(LOCALE_STORAGE_KEY);
  });

  it('defaults to Spanish when no preference is stored', () => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });
    const service = TestBed.inject(LanguageService);
    expect(service.current()).toBe('es');
  });

  it('reads a stored preference', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'en');
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });
    const service = TestBed.inject(LanguageService);
    expect(service.current()).toBe('en');
  });

  it('ignores unsupported stored values and falls back to Spanish', () => {
    localStorage.setItem(LOCALE_STORAGE_KEY, 'pt');
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });
    const service = TestBed.inject(LanguageService);
    expect(service.current()).toBe('es');
  });

  it('updates the active language and persists it', async () => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });
    const service = TestBed.inject(LanguageService);
    service.setLanguage('en');
    expect(service.current()).toBe('en');
    expect(localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
  });

  it('rejects unsupported languages', () => {
    TestBed.configureTestingModule({
      providers: [
        LanguageService,
        { provide: TranslateService, useClass: FakeTranslateService },
      ],
    });
    const service = TestBed.inject(LanguageService);
    const initial = service.current();
    service.setLanguage('pt' as 'es');
    expect(service.current()).toBe(initial);
  });
});
