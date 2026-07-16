import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

interface PillarCard {
  readonly path: string;
  readonly title: string;
  readonly description: string;
  readonly accent: string;
}

@Component({
  selector: 'orion-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  protected readonly user = this.auth.user;

  protected readonly pillars: readonly PillarCard[] = [
    {
      path: '/assignments',
      title: 'Asignación de Censos',
      description:
        'Cruza nodos disponibles con cuotas y calendarios para proponer asignaciones de hogares a vendedores.',
      accent: 'bg-indigo-500',
    },
    {
      path: '/expansion',
      title: 'Expansión de Redes',
      description:
        'Detecta oportunidades de expansión cruzando hogares sin cobertura con zonas de alta demanda.',
      accent: 'bg-emerald-500',
    },
    {
      path: '/maintenance',
      title: 'Mantenimiento por Riesgo',
      description:
        'Prioriza intervenciones en nodos con historial de caídas y señales de saturación sistemática.',
      accent: 'bg-amber-500',
    },
    {
      path: '/post-sale',
      title: 'Seguimiento Post-Venta',
      description:
        'Programa encuestas de seguimiento aplicando la política de hostigamiento comercial.',
      accent: 'bg-rose-500',
    },
  ];
}
