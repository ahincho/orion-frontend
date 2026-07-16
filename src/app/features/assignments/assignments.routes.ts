import type { Routes } from '@angular/router';

export const ASSIGNMENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/assignments-list').then((m) => m.AssignmentsList),
  },
];
