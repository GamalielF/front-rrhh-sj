import { Routes } from '@angular/router';
import { authGuard } from '@lumen/auth';
import { DashboardShellComponent } from './core/layout/dashboard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'credits',
        data: {
          breadcrumb: { label: 'Créditos en Mora', icon: '@tui.credit-card' },
        },
        loadComponent: () => import('./features/credits-list/credits-list.component').then(m => m.CreditsListComponent),
      },
      {
        path: 'test',
        data: {
          breadcrumb: { label: 'Página de Prueba', icon: '@tui.info' },
        },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/test-page/test-page.component').then(m => m.TestPageComponent),
          },
          {
            path: 'detalle',
            data: {
              breadcrumb: { label: 'hola 1', icon: '@tui.layers' },
            },
            children: [
              {
                path: '',
                loadComponent: () => import('./features/test-detail/test-detail.component').then(m => m.TestDetailComponent),
              },
              {
                path: 'subnivel',
                data: {
                  breadcrumb: { label: 'hola 2', icon: '@tui.layers' },
                },
                loadComponent: () => import('./features/test-subdetail/test-subdetail.component').then(m => m.TestSubdetailComponent),
              },
            ],
          },
        ],
      },
      { path: '', redirectTo: 'credits', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'credits' },
];
