import { ActivatedRouteSnapshot, Routes } from '@angular/router';
import { authGuard } from '@lumen/auth';
import { formatearPeriodo } from '@core/utils';
import { DashboardShellComponent } from './core/layout/dashboard';
import { rolesAplicacionGuard } from './core/guards';

const SUFIJO_TITULO = 'Roles de pago';

export const tituloDelPeriodo = (ruta: ActivatedRouteSnapshot): string =>
  `Período ${formatearPeriodo(ruta.paramMap.get('periodo') ?? '')} · ${SUFIJO_TITULO}`;

export const routes: Routes = [
  {
    path: 'login',
    title: `Iniciar sesión · ${SUFIJO_TITULO}`,
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    component: DashboardShellComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        title: `Inicio · ${SUFIJO_TITULO}`,
        data: {
          breadcrumb: { label: 'Inicio', icon: '@tui.house' },
        },
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
      },
      {
        path: 'mi-rol',
        title: `Mi rol de pago · ${SUFIJO_TITULO}`,
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
            title: `Períodos · ${SUFIJO_TITULO}`,
            loadComponent: () => import('./features/rrhh/periodos').then(m => m.PeriodosComponent),
          },
          {
            path: ':periodo',
            title: tituloDelPeriodo,
            data: {
              breadcrumb: { label: ':periodo', icon: '@tui.folder-open' },
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
            title: `Usuarios y roles · ${SUFIJO_TITULO}`,
            data: {
              breadcrumb: { label: 'Usuarios y roles', icon: '@tui.user-cog' },
            },
            loadComponent: () => import('./features/admin/usuarios').then(m => m.UsuariosComponent),
          },
          {
            path: 'directorio',
            title: `Directorio · ${SUFIJO_TITULO}`,
            data: {
              breadcrumb: { label: 'Directorio', icon: '@tui.database' },
            },
            loadComponent: () => import('./features/admin/directorio').then(m => m.DirectorioComponent),
          },
          {
            path: 'auditoria',
            title: `Auditoría · ${SUFIJO_TITULO}`,
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
