import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import type { PolygonInfoGeneral } from '../../../core/types/assignment.types';

export interface ConfirmAssignmentContext {
  readonly polygon: PolygonInfoGeneral;
  readonly supervisorId: string;
  readonly supervisorName: string;
  readonly distribuidorId: string;
  readonly distribuidorName: string;
  readonly fechaProgramada: string;
  readonly duracionEstimadaMin: number;
  readonly nota: string | null;
}

/**
 * Modal that summarizes a draft assignment and asks the user for final
 * confirmation. The orchestrator owns the supervisor + distributor pickers
 * and the date input; this component only renders the resulting snapshot
 * and confirms.
 */
@Component({
  selector: 'orion-confirm-modal',
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe],
})
export class ConfirmModal {
  readonly context = input.required<ConfirmAssignmentContext>();

  readonly submitForm = output<void>();
  readonly cancelDialog = output<void>();
  readonly noteChange = output<string>();

  protected onNoteChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    if (!target) {
      return;
    }
    this.noteChange.emit(target.value);
  }
}
