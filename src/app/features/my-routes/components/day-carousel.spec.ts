import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DayCarousel, type DayCarouselItem } from './day-carousel';
import { FakeTranslateService } from '../../../core/i18n/fake-translate';
import type { DailySummary } from '../../../core/types/my-routes.types';

const SUMMARIES: Record<string, DailySummary> = {
  '2026-07-21': {
    fecha: '2026-07-21',
    totalHogares: 100,
    hogaresCompletados: 80,
    hogaresPendientes: 20,
    porcentajeAvance: 80,
    tecnologia: 'GPON',
  },
  '2026-07-22': {
    fecha: '2026-07-22',
    totalHogares: 200,
    hogaresCompletados: 0,
    hogaresPendientes: 200,
    porcentajeAvance: 0,
    tecnologia: 'HFC',
  },
};

const DAYS: readonly DayCarouselItem[] = [
  {
    fecha: '2026-07-21',
    label: 'mar 21 jul',
    summary: SUMMARIES['2026-07-21'],
    assignmentId: 'pol-1',
  },
  {
    fecha: '2026-07-22',
    label: 'mié 22 jul',
    summary: SUMMARIES['2026-07-22'],
    assignmentId: 'pol-2',
  },
];

describe('DayCarousel', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DayCarousel, TranslatePipe],
      providers: [{ provide: TranslateService, useClass: FakeTranslateService }],
    });
  });

  it('emits the picked day when a tab is activated', () => {
    const fixture = TestBed.createComponent(DayCarousel);
    fixture.componentRef.setInput('days', DAYS);
    fixture.componentRef.setInput('selectedDate', DAYS[0].fecha);
    fixture.detectChanges();

    let emitted: string | null = null;
    fixture.componentInstance.pickDay.subscribe((date) => {
      emitted = date;
    });

    const tabs = fixture.nativeElement.querySelectorAll(
      '.day-carousel__item',
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabs.length).toBe(2);
    tabs[1].click();

    expect(emitted).toBe(DAYS[1].fecha);
  });
});
