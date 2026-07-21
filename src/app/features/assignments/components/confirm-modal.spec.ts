import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { ConfirmModal, type ConfirmAssignmentContext } from './confirm-modal';
import { FakeTranslateService } from '../../../core/i18n/fake-translate';
import type { PolygonInfoGeneral } from '../../../core/types/assignment.types';

const POLYGON: PolygonInfoGeneral = {
  id: 'pol-1',
  code: 'LIM-TST-001',
  name: 'Miraflores Centro',
  technology: 'GPON',
  classification: 'A',
  status: 'active',
  totalHouseholds: 900,
  householdsWithService: 720,
  householdsWithoutService: 180,
  lastAssignmentDate: '2026-07-12',
};

const CONTEXT: ConfirmAssignmentContext = {
  polygon: POLYGON,
  supervisorId: 'sup-001',
  supervisorName: 'Rosa Delgado',
  distributorId: 'dist-001',
  distributorName: 'Lima Centro',
  scheduledDate: '2026-07-25',
  estimatedDurationMin: 90,
  note: 'Verificar conexión GPON.',
};

function findButton(
  root: HTMLElement,
  testId: string,
): HTMLButtonElement | null {
  return root.querySelector<HTMLButtonElement>(`[data-testid="${testId}"]`);
}

describe('ConfirmModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmModal, TranslatePipe],
      providers: [{ provide: TranslateService, useClass: FakeTranslateService }],
    });
  });

  it('emits submitForm from the confirm button', () => {
    const fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('context', CONTEXT);
    fixture.detectChanges();

    let submitEmitted = false;
    fixture.componentInstance.submitForm.subscribe(() => {
      submitEmitted = true;
    });
    const confirmButton = findButton(
      fixture.nativeElement,
      'confirm-modal-confirm',
    );
    confirmButton?.click();
    expect(submitEmitted).toBe(true);
  });

  it('emits cancelDialog from the cancel button', () => {
    const fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('context', CONTEXT);
    fixture.detectChanges();

    let cancelEmitted = false;
    fixture.componentInstance.cancelDialog.subscribe(() => {
      cancelEmitted = true;
    });
    const cancelButton = findButton(
      fixture.nativeElement,
      'confirm-modal-cancel',
    );
    cancelButton?.click();
    expect(cancelEmitted).toBe(true);
  });

  it('emits the typed note from a textarea event', () => {
    const fixture = TestBed.createComponent(ConfirmModal);
    fixture.componentRef.setInput('context', CONTEXT);
    fixture.detectChanges();

    let captured: string | null = null;
    fixture.componentInstance.noteChange.subscribe((note) => {
      captured = note;
    });

    const textarea = fixture.nativeElement.querySelector('textarea');
    textarea.value = 'Necesito un ayudante.';
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: textarea });
    const component = fixture.componentInstance as unknown as {
      onNoteChange: (event: Event) => void;
    };
    component.onNoteChange(event);

    expect(captured).toBe('Necesito un ayudante.');
  });
});
