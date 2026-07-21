import type { Routes } from '@angular/router';

export const MY_ROUTES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-routes-list').then((m) => m.MyRoutesList),
  },
];
