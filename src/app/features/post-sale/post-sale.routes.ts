import type { Routes } from '@angular/router';

export const POST_SALE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/post-sale-list').then((m) => m.PostSaleList),
  },
];
