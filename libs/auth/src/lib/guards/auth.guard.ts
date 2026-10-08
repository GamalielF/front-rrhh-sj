import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AUTH_CONFIG, DEFAULT_AUTH_CONFIG } from '../tokens/auth.token';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG, { optional: true });
  const loginUrl = config?.loginRedirectUrl || DEFAULT_AUTH_CONFIG.loginRedirectUrl;

  if (authService.isAuthenticated()) {
    return true;
  }

  if (authService.canRefresh()) {
    return authService.refreshAccessToken().pipe(
      map(() => true),
      catchError(() => {
        authService.logout();
        return of(router.parseUrl(loginUrl));
      })
    );
  }

  return router.parseUrl(loginUrl);
};
