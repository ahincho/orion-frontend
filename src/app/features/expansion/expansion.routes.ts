import type { Routes } from '@angular/router';

export const EXPANSION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/expansion-list').then((m) => m.ExpansionList),
  },
];
