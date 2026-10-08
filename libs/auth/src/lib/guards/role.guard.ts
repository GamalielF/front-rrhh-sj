import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AUTH_CONFIG, DEFAULT_AUTH_CONFIG } from '../tokens/auth.token';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG, { optional: true });

  const loginUrl = config?.loginRedirectUrl || DEFAULT_AUTH_CONFIG.loginRedirectUrl;
  const forbiddenUrl = config?.forbiddenRedirectUrl || DEFAULT_AUTH_CONFIG.forbiddenRedirectUrl;

  const checkRoles = () => {
    const requiredRoles: string[] = route.data?.['roles'] ?? [];
    if (requiredRoles.length === 0 || authService.hasAnyRole(requiredRoles)) {
      return true;
    }
    return router.parseUrl(forbiddenUrl);
  };

  if (authService.isAuthenticated()) {
    return checkRoles();
  }

  if (authService.canRefresh()) {
    return authService.refreshAccessToken().pipe(
      map(() => checkRoles()),
      catchError(() => {
        authService.logout();
        return of(router.parseUrl(loginUrl));
      })
    );
  }

  return router.parseUrl(loginUrl);
};
