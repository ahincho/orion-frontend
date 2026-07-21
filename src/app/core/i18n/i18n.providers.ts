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
 */
export function provideI18n() {
  const language = inject(LanguageService);
  const translate = inject(TranslateService);
  return [
    provideTranslateService({
      lang: language.current(),
      fallbackLang: DEFAULT_LANGUAGE,
      loader: AssetsTranslateLoader,
    }),
    provideAppInitializer(() => {
      translate.addLangs([...language.languages()]);
      return translate.use(language.current()).toPromise();
    }),
  ];
}
