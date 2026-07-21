import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from './language.service';
import { SUPPORTED_LANGUAGES, type Language } from './i18n.types';

@Component({
  selector: 'orion-language-switcher',
  imports: [TranslatePipe],
  host: { class: 'inline-flex' },
  template: `
    <div
      class="inline-flex items-center gap-1 rounded-full bg-slate-900/5 p-1 text-inherit dark:bg-slate-100/10"
      role="group"
      aria-labelledby="common-languages-label"
    >
      <span
        id="common-languages-label"
        class="px-2 text-xs font-semibold uppercase tracking-wider opacity-70"
      >
        {{ 'common.languages.label' | translate }}
      </span>
      @for (lang of languages; track lang) {
        <button
          type="button"
          class="rounded-full border-0 bg-transparent px-3 py-0.5 text-sm font-semibold text-inherit transition-colors duration-150"
          [class.bg-indigo-600]="lang === active()"
          [class.text-slate-50]="lang === active()"
          [class.hover:bg-indigo-700]="lang === active()"
          [attr.aria-pressed]="lang === active()"
          (click)="select(lang)"
        >
          {{ 'common.languages.' + lang | translate }}
        </button>
      }
    </div>
  `,
})
export class LanguageSwitcherComponent {
  private readonly service = inject(LanguageService);

  protected readonly active = this.service.current;
  protected readonly languages = SUPPORTED_LANGUAGES;

  protected select(language: Language): void {
    this.service.setLanguage(language);
  }
}
