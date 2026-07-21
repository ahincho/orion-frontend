import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import type { DailySummary } from '../../../core/types/my-routes.types';

export interface DayCarouselItem {
  readonly fecha: string;
  readonly label: string;
  readonly summary: DailySummary | null;
  readonly assignmentId: string | null;
}

@Component({
  selector: 'orion-day-carousel',
  templateUrl: './day-carousel.html',
  styleUrl: './day-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class DayCarousel {
  readonly days = input.required<readonly DayCarouselItem[]>();
  readonly selectedDate = input.required<string | null>();

  readonly pickDay = output<string>();

  protected onPick(value: string): void {
    this.pickDay.emit(value);
  }
}
