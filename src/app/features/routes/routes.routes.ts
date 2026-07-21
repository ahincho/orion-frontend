import type { Routes } from '@angular/router';

export const ROUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/routes-list').then((m) => m.RoutesList),
  },
];
