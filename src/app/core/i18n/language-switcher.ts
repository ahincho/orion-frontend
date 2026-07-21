import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { LanguageService } from './language.service';
import { SUPPORTED_LANGUAGES, type Language } from './i18n.types';

@Component({
  selector: 'orion-language-switcher',
  imports: [TranslatePipe],
  template: `
    <div class="language-switcher" role="group" aria-labelledby="language-label">
      <span id="language-label" class="language-switcher__label">
        {{ 'language.label' | translate }}
      </span>
      @for (lang of languages; track lang) {
        <button
          type="button"
          class="language-switcher__option"
          [class.language-switcher__option--active]="lang === active()"
          [attr.aria-pressed]="lang === active()"
          (click)="select(lang)"
        >
          {{ ('language.' + lang) | translate }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .language-switcher {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem;
      border-radius: 9999px;
      background: rgba(15, 23, 42, 0.05);
      color: inherit;
    }

    .language-switcher__label {
      padding: 0 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.7;
    }

    .language-switcher__option {
      border: 0;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      background: transparent;
      color: inherit;
      font-weight: 600;
      font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 120ms ease;
  }

  .language-switcher__option:hover {
    background: rgba(79, 70, 229, 0.15);
  }

  .language-switcher__option--active {
    background: #4f46e5;
    color: #f8fafc;
  }

  .language-switcher__option--active:hover {
    background: #6366f1;
  }
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
