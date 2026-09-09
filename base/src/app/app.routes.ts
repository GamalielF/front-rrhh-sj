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
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
