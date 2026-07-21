import { TestBed } from '@angular/core/testing';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { PolygonInfoModal } from './polygon-info-modal';
import { FakeTranslateService } from '../../../core/i18n/fake-translate';
import type { PolygonInfoGeneral } from '../../../core/types/assignment.types';

const SAMPLE: PolygonInfoGeneral = {
  id: 'pol-1',
  codigo: 'LIM-TST-001',
  nombre: 'San Borja Centro',
  tecnologia: 'GPON',
  clasificacion: 'A',
  estado: 'active',
  totalHogares: 1000,
  hogaresConServicio: 800,
  hogaresSinServicio: 200,
  ultimaAsignacionFecha: null,
};

function buttons(root: HTMLElement): NodeListOf<HTMLButtonElement> {
  return root.querySelectorAll('button');
}

describe('PolygonInfoModal', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PolygonInfoModal, TranslatePipe],
      providers: [{ provide: TranslateService, useClass: FakeTranslateService }],
    });
  });

  it('emits the polygon when the assign button is clicked', () => {
    const fixture = TestBed.createComponent(PolygonInfoModal);
    fixture.componentRef.setInput('polygon', SAMPLE);
    fixture.detectChanges();

    let emitted: PolygonInfoGeneral | null = null;
    fixture.componentInstance.assignPolygon.subscribe((entry) => {
      emitted = entry;
    });
    const allButtons = buttons(fixture.nativeElement);
    const assignButton = Array.from(allButtons).find((button) =>
      button.classList.contains('polygon-info-modal__assign'),
    );
    expect(assignButton).toBeTruthy();
    assignButton?.click();
    expect(emitted).toEqual(SAMPLE);
  });

  it('emits when the close button is clicked', () => {
    const fixture = TestBed.createComponent(PolygonInfoModal);
    fixture.componentRef.setInput('polygon', SAMPLE);
    fixture.detectChanges();

    let closed = false;
    fixture.componentInstance.dismiss.subscribe(() => {
      closed = true;
    });
    const closeButton = Array.from(buttons(fixture.nativeElement)).find(
      (button) => button.classList.contains('polygon-info-modal__close'),
    );
    closeButton?.click();
    expect(closed).toBe(true);
  });
});
