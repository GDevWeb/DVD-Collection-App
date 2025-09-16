import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages/dvd-list',
    pathMatch: 'full',
  },
  {
    path: 'pages/dvd-list',
    loadComponent: () =>
      import('./pages/dvd-list/dvd-list.page').then((m) => m.DvdListPage),
  },
  {
    path: 'pages/scanner',
    loadComponent: () =>
      import('./pages/scanner/scanner.page').then((m) => m.ScannerPage),
  },
];
