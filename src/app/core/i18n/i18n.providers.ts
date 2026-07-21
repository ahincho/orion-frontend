import {
  provideAppInitializer,
  inject,
} from '@angular/core';
import {
  provideTranslateService,
  TranslateService,
  type TranslateLoader,
  type TranslationObject,
} from '@ngx-translate/core';
import type { Observable} from 'rxjs';
import { from } from 'rxjs';

import { LanguageService } from './language.service';
import { DEFAULT_LANGUAGE } from './i18n.types';

/**
 * Custom HTTP-free loader. Resolves translations from `/assets/i18n/<lang>.json`
 * through `fetch`, which Angular does not polyfill with HttpClient but every
 * browser running the SPA already provides.
 */
export class AssetsTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    if (typeof fetch !== 'function') {
      return from(Promise.resolve({} as TranslationObject));
    }
    const promise = fetch(`/assets/i18n/${lang}.json`).then((response) => {
      if (!response.ok) {
        throw new Error(`i18n file missing for "${lang}"`);
      }
      return response.json() as Promise<TranslationObject>;
    });
    return from(promise);
  }
}

/**
 * Standalone i18n providers. Wires `@ngx-translate/core` against the runtime
 * JSON dictionaries under `/assets/i18n/<lang>.json` and seeds the active
 * language once TranslateService is ready.
 *
 * `inject()` can only be called from an active injection context. This helper
 * is invoked from the `providers:` array of `ApplicationConfig`, which is
 * evaluated *before* the application injector exists, so calls to `inject()`
 * at the top of this function would throw NG0203. The translation choices
 * are resolved inside the `provideAppInitializer` factory, which Angular
 * runs once an injector is available.
 */
export function provideI18n() {
  return [
    provideTranslateService({
      lang: DEFAULT_LANGUAGE,
      fallbackLang: DEFAULT_LANGUAGE,
      loader: AssetsTranslateLoader,
    }),
    provideAppInitializer(() => {
      const language = inject(LanguageService);
      const translate = inject(TranslateService);
      const current = language.current();
      translate.addLangs([...language.languages()]);
      return translate.use(current);
    }),
  ];
}
