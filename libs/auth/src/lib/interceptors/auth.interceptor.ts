import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { AUTH_CONFIG, DEFAULT_AUTH_CONFIG } from '../tokens/auth.token';
import { addAuthHeader, handleTokenRefresh } from './token-refresh.handler';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG, { optional: true });

  const loginUrl = config?.loginRedirectUrl ?? DEFAULT_AUTH_CONFIG.loginRedirectUrl;
  const refreshUrl = config?.refreshUrl ?? DEFAULT_AUTH_CONFIG.refreshUrl;
  const enableRefreshToken = config?.enableRefreshToken ?? DEFAULT_AUTH_CONFIG.enableRefreshToken;

  const token = authService.getToken();
  const authReq = token ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        enableRefreshToken &&
        authService.getRefreshToken()
      ) {
        return handleTokenRefresh(req, next, authService, router, loginUrl, refreshUrl);
      }

      if (error instanceof HttpErrorResponse && error.status === 401) {
        authService.logout();
        router.navigateByUrl(loginUrl);
      }

      return throwError(() => error);
    })
  );
};
