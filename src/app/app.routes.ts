import type { Routes } from '@angular/router';

import { authGuard, guestGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/login/login').then((m) => m.Login),
    title: 'ORION · Iniciar sesión',
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    loadComponent: () =>
      import('./core/layout/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
        title: 'ORION · Inicio',
      },
      {
        path: 'assignments',
        loadChildren: () =>
          import('./features/assignments/assignments.routes').then((m) => m.ASSIGNMENTS_ROUTES),
        title: 'ORION · Asignación de Censos',
      },
      {
        path: 'expansion',
        loadChildren: () =>
          import('./features/expansion/expansion.routes').then((m) => m.EXPANSION_ROUTES),
        title: 'ORION · Expansión de Redes',
      },
      {
        path: 'maintenance',
        loadChildren: () =>
          import('./features/maintenance/maintenance.routes').then((m) => m.MAINTENANCE_ROUTES),
        title: 'ORION · Mantenimiento por Riesgo',
      },
      {
        path: 'post-sale',
        loadChildren: () =>
          import('./features/post-sale/post-sale.routes').then((m) => m.POST_SALE_ROUTES),
        title: 'ORION · Seguimiento Post-Venta',
      },
    ],
  },
  {
    // TODO(spike): gate behind isDevMode() before any production exposure.
    // For now this public route exists only to validate the map engine
    // outside of the auth flow during PR-0a of the maps spike.
    path: '__maps-spike',
    loadChildren: () =>
      import('./features/maps-spike/maps-spike.routes').then(
        (m) => m.MAPS_SPIKE_ROUTES,
      ),
    title: 'ORION · Spike Mapas',
  },
  { path: '**', redirectTo: 'login' },
];
