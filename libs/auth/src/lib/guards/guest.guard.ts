import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AUTH_CONFIG, DEFAULT_AUTH_CONFIG } from '../tokens/auth.token';

export const guestGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG, { optional: true });
  const defaultUrl = config?.defaultRedirectUrl || DEFAULT_AUTH_CONFIG.defaultRedirectUrl;

  if (authService.isAuthenticated()) {
    return router.parseUrl(defaultUrl);
  }

  return true;
};
