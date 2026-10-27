import { Routes } from '@angular/router';
import { authGuard } from '@lumen/auth';
import { DashboardShellComponent } from './core/layout/dashboard';
import { rolesAplicacionGuard } from './core/guards';

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
        path: 'mi-rol',
        data: {
          breadcrumb: { label: 'Mi rol de pago', icon: '@tui.file-text' },
        },
        loadComponent: () => import('./features/mi-rol-pago/mi-rol-pago.component').then(m => m.MiRolPagoComponent),
      },
      {
        path: 'rrhh/periodos',
        canActivate: [rolesAplicacionGuard('RRHH', 'ADMIN')],
        data: {
          breadcrumb: { label: 'Períodos', icon: '@tui.calendar' },
        },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/rrhh/periodos').then(m => m.PeriodosComponent),
          },
          {
            path: ':periodo',
            data: {
              breadcrumb: { label: 'Detalle', icon: '@tui.folder-open' },
            },
            loadComponent: () => import('./features/rrhh/periodo-detalle').then(m => m.PeriodoDetalleComponent),
          },
        ],
      },
      {
        path: 'admin',
        canActivate: [rolesAplicacionGuard('ADMIN')],
        data: {
          breadcrumb: { label: 'Administración', icon: '@tui.shield-check' },
        },
        children: [
          { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
          {
            path: 'usuarios',
            data: {
              breadcrumb: { label: 'Usuarios y roles', icon: '@tui.user-cog' },
            },
            loadComponent: () => import('./features/admin/usuarios').then(m => m.UsuariosComponent),
          },
          {
            path: 'directorio',
            data: {
              breadcrumb: { label: 'Directorio', icon: '@tui.database' },
            },
            loadComponent: () => import('./features/admin/directorio').then(m => m.DirectorioComponent),
          },
          {
            path: 'auditoria',
            data: {
              breadcrumb: { label: 'Auditoría', icon: '@tui.clipboard-list' },
            },
            loadComponent: () => import('./features/admin/auditoria').then(m => m.AuditoriaComponent),
          },
        ],
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'home' },
];
