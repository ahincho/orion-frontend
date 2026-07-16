import type { Routes } from '@angular/router';

export const MAINTENANCE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/maintenance-list').then((m) => m.MaintenanceList),
  },
];
