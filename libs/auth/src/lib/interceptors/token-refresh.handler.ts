import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, throwError, Observable } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export function handleTokenRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router,
  loginUrl: string,
  refreshUrl: string
): Observable<HttpEvent<unknown>> {
  if (req.url.includes(refreshUrl)) {
    return throwError(() => new Error('Refresh token request failed'));
  }

  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => next(addAuthHeader(req, token!)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshAccessToken().pipe(
    switchMap((response) => {
      isRefreshing = false;
      const newToken = response.accessToken || response.token;
      if (!newToken) {
        authService.logout();
        router.navigateByUrl(loginUrl);
        return throwError(() => new Error('No access token in refresh response'));
      }
      refreshTokenSubject.next(newToken);
      return next(addAuthHeader(req, newToken));
    }),
    catchError((err) => {
      isRefreshing = false;
      refreshTokenSubject.next(null);
      authService.logout();
      router.navigateByUrl(loginUrl);
      return throwError(() => err);
    })
  );
}

export { addAuthHeader };
