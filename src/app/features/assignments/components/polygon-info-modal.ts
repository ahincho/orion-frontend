import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import type { PolygonInfoGeneral } from '../../../core/types/assignment.types';

/**
 * Modal that surfaces the metadata associated with a clicked polygon. The
 * orchestrator owns the action handlers and signals; this component is
 * purely presentational and forwards user intent.
 */
@Component({
  selector: 'orion-polygon-info-modal',
  templateUrl: './polygon-info-modal.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class PolygonInfoModal {
  readonly polygon = input.required<PolygonInfoGeneral>();

  readonly assignPolygon = output<PolygonInfoGeneral>();
  readonly dismiss = output<void>();

  protected onAssign(): void {
    this.assignPolygon.emit(this.polygon());
  }

  protected onClose(): void {
    this.dismiss.emit();
  }
}
