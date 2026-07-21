import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../core/auth/auth.service';

interface PillarCard {
  readonly path: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly accent: string;
}

@Component({
  selector: 'orion-dashboard',
  imports: [RouterLink, TranslatePipe],
  host: { class: 'block h-full' },
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private readonly auth = inject(AuthService);
  protected readonly user = this.auth.user;

  protected readonly pillars: readonly PillarCard[] = [
    {
      path: '/assignments',
      titleKey: 'dashboard.pillars.assignments.title',
      descriptionKey: 'dashboard.pillars.assignments.description',
      accent: 'bg-indigo-500',
    },
    {
      path: '/expansion',
      titleKey: 'dashboard.pillars.expansion.title',
      descriptionKey: 'dashboard.pillars.expansion.description',
      accent: 'bg-emerald-500',
    },
    {
      path: '/maintenance',
      titleKey: 'dashboard.pillars.maintenance.title',
      descriptionKey: 'dashboard.pillars.maintenance.description',
      accent: 'bg-amber-500',
    },
    {
      path: '/post-sale',
      titleKey: 'dashboard.pillars.postSale.title',
      descriptionKey: 'dashboard.pillars.postSale.description',
      accent: 'bg-rose-500',
    },
  ];
}
