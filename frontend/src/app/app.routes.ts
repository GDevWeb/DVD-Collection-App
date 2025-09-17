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
  {
    path: 'pages/search-results',
    loadComponent: () =>
      import('./pages/search-results/search-results.page').then(
        (m) => m.SearchResultsPage
      ),
  },
  {
    path: 'manual-entry',
    loadComponent: () =>
      import('./pages/manual-entry/manual-entry.page').then(
        (m) => m.ManualEntryPage
      ),
  },
];
