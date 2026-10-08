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
        path: 'home',
        data: {
          breadcrumb: { label: 'Inicio', icon: '@tui.house' },
        },
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
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
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
