import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'credits',
    loadComponent: () => import('./features/credits-list/credits-list.component').then(m => m.CreditsListComponent),
    canActivate: [authGuard]
  },
  { path: '', redirectTo: '/credits', pathMatch: 'full' },
  { path: '**', redirectTo: '/credits' }
];
