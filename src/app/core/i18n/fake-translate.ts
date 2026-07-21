import { Injectable, signal, type Signal } from '@angular/core';
import { type Observable, of } from 'rxjs';
import type {
  LangChangeEvent,
  Translation,
  TranslationChangeEvent,
  TranslationObject,
} from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class FakeTranslateService {
  private readonly placeholder = signal<string>('');

  instant(): string {
    return '';
  }
  instantFallback(): string {
    return '';
  }
  use(): Promise<unknown> {
    return Promise.resolve();
  }
  addLangs(): void {
    /* noop */
  }
  translate(
    _key: string | string[] | (() => string | string[]),
  ): Signal<Translation | TranslationObject> {
    return this.placeholder as unknown as Signal<Translation | TranslationObject>;
  }
  get(key: string | string[]): Observable<Translation | TranslationObject> {
    return of(typeof key === 'string' ? key : ({} as TranslationObject));
  }
  stream(key: string | string[]): Observable<Translation | TranslationObject> {
    return this.get(key);
  }
  onTranslationChange(): Observable<TranslationChangeEvent> {
    return of({} as TranslationChangeEvent);
  }
  onLangChange(): Observable<LangChangeEvent> {
    return of({} as LangChangeEvent);
  }
  onDefaultLangChange(): Observable<LangChangeEvent> {
    return of({} as LangChangeEvent);
  }
  onTranslationLoad(): Observable<unknown> {
    return of({});
  }
  getBrowserLang(): string {
    return 'en';
  }
  getBrowserCultureLang(): string {
    return 'en-US';
  }
  currentLang = 'en';
  defaultLang = 'en';
  translations: Record<string, unknown> = {};
}
