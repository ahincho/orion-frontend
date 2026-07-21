import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { DayCarousel, type DayCarouselItem } from './day-carousel';
import { FakeTranslateService } from '../../../core/i18n/fake-translate';
import type { DailySummary } from '../../../core/types/routes.types';

const SUMMARIES: Record<string, DailySummary> = {
  '2026-07-21': {
    date: '2026-07-21',
    totalHouseholds: 100,
    householdsCompleted: 80,
    householdsPending: 20,
    progressPercent: 80,
    technology: 'GPON',
  },
  '2026-07-22': {
    date: '2026-07-22',
    totalHouseholds: 200,
    householdsCompleted: 0,
    householdsPending: 200,
    progressPercent: 0,
    technology: 'HFC',
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
      '[data-testid="day-carousel-item"]',
    ) as NodeListOf<HTMLButtonElement>;
    expect(tabs.length).toBe(2);
    tabs[1].click();

    expect(emitted).toBe(DAYS[1].fecha);
  });
});
