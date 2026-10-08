import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  tap,
  catchError,
  throwError,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  LoginCredentials,
  LoginResponse,
  UserSession,
  AuthConfig,
  UserProfileLoader,
} from '../models/auth.models';
import {
  AUTH_CONFIG,
  DEFAULT_AUTH_CONFIG,
  USER_PROFILE_LOADER,
} from '../tokens/auth.token';
import { getClaimFromToken, isTokenExpired } from '../utils/jwt.utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService<TUser extends UserSession = UserSession> {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private config: Required<AuthConfig> = {
    ...DEFAULT_AUTH_CONFIG,
    ...(inject(AUTH_CONFIG, { optional: true }) || {}),
  };
  private profileLoader = inject<UserProfileLoader<TUser>>(USER_PROFILE_LOADER, {
    optional: true,
  });

  private memoryToken: string | null = null;
  private memoryRefreshToken: string | null = null;

  private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());
  private userSubject = new BehaviorSubject<TUser | null>(this.getInitialUser());

  readonly token$ = this.tokenSubject.asObservable();
  readonly user$ = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.tokenSubject.pipe(map((token) => !!token));

  login(credentialsOrUsername: string | LoginCredentials, password?: string): Observable<LoginResponse<TUser>> {
    const body =
      typeof credentialsOrUsername === 'string'
        ? { username: credentialsOrUsername, password }
        : credentialsOrUsername;

    const username =
      typeof credentialsOrUsername === 'string'
        ? credentialsOrUsername
        : (credentialsOrUsername.username as string) || '';

    return this.http
      .post<LoginResponse<TUser>>(this.config.loginUrl, body, {
        withCredentials: this.config.withCredentials,
      })
      .pipe(
        switchMap((response) => {
          if (response.accessToken && response.tokenType) {
            const user = (response.user || ({ username } as unknown)) as TUser;
            this.setSession(response.accessToken, user, response.refreshToken);

            if (this.profileLoader) {
              return this.loadUserProfile(username).pipe(
                map((profile) => ({
                  ...response,
                  user: profile || user,
                })),
                catchError(() => of(response))
              );
            }
          }
          return of(response);
        }),
        catchError((error) => throwError(() => error))
      );
  }

  verifyMfa(accessToken: string, totpCode: string): Observable<LoginResponse<TUser>> {
    return this.http
      .post<LoginResponse<TUser>>(
        this.config.mfaVerifyUrl,
        { accessToken, totpCode },
        { withCredentials: this.config.withCredentials }
      )
      .pipe(
        switchMap((response) => {
          if (response.accessToken) {
            const currentUsername =
              response.user?.username ||
              this.userSubject.getValue()?.username ||
              this.getUsernameFromToken(response.accessToken) ||
              '';

            const user = (response.user || ({ username: currentUsername } as unknown)) as TUser;
            this.setSession(response.accessToken, user, response.refreshToken);

            if (this.profileLoader) {
              return this.loadUserProfile(currentUsername).pipe(
                map((profile) => ({
                  ...response,
                  user: profile || user,
                })),
                catchError(() => of(response))
              );
            }
          }
          return of(response);
        }),
        catchError((error) => throwError(() => error))
      );
  }

  loadUserProfile(customUsername?: string): Observable<TUser | null> {
    const token = this.getToken() || undefined;
    const currentUser = this.userSubject.getValue();
    const username =
      customUsername ||
      currentUser?.username ||
      (token ? this.getUsernameFromToken(token) || undefined : undefined);

    if (!this.profileLoader) {
      return of(currentUser);
    }

    return this.profileLoader
      .loadProfile({
        username,
        token,
        currentUser,
      })
      .pipe(
        tap((profile) => {
          if (profile) {
            this.setUser(profile, this.config.persistUserInStorage);
          }
        }),
        catchError((error) => {
          return of(this.userSubject.getValue());
        })
      );
  }

  setSession(token: string, user?: TUser, refreshToken?: string): void {
    this.setToken(token);
    if (user) {
      this.setUser(user, this.config.persistUserInStorage);
    }
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  private setToken(token: string): void {
    if (this.config.tokenStorage === 'memory') {
      this.memoryToken = token;
    } else if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(this.config.tokenName, token);
    }
    this.tokenSubject.next(token);
  }

  setUser(user: TUser, persist = this.config.persistUserInStorage): void {
    if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      if (persist) {
        storage.setItem(`${this.config.tokenName}_user`, JSON.stringify(user));
      } else {
        storage.removeItem(`${this.config.tokenName}_user`);
      }
    }
    this.userSubject.next(user);
  }

  getToken(): string | null {
    return this.tokenSubject.getValue() || this.getStoredToken();
  }

  private getStoredToken(): string | null {
    if (this.config.tokenStorage === 'memory') {
      return this.memoryToken;
    }
    if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      return storage.getItem(this.config.tokenName);
    }
    return null;
  }


  private getStoredUser(): TUser | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
    const raw = storage.getItem(`${this.config.tokenName}_user`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as TUser;
    } catch {
      return null;
    }
  }

  getUsernameFromToken(tokenString?: string): string | null {
    const token = tokenString || this.getToken();
    if (!token) return null;
    return getClaimFromToken(token, this.config.usernameClaim);
  }


  getUser(): TUser | null {
    return this.userSubject.getValue() || this.getStoredUser();
  }

  private getInitialUser(): TUser | null {
    return this.getStoredUser();
  }

  getRefreshToken(): string | null {
    if (this.config.tokenStorage === 'memory') {
      return this.memoryRefreshToken;
    }
    if (!isPlatformBrowser(this.platformId)) return null;
    const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
    return storage.getItem(`${this.config.tokenName}_refresh`);
  }


  private setRefreshToken(token: string): void {
    if (this.config.tokenStorage === 'memory') {
      this.memoryRefreshToken = token;
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.setItem(`${this.config.tokenName}_refresh`, token);
    }
  }

  private removeRefreshToken(): void {
    if (this.config.tokenStorage === 'memory') {
      this.memoryRefreshToken = null;
      return;
    }
    if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(`${this.config.tokenName}_refresh`);
    }
  }

  canRefresh(): boolean {
    if (!this.config.enableRefreshToken) {
      return false;
    }
    const isCookieRefresh = this.config.refreshMode === 'cookie';
    return isCookieRefresh || !!this.getRefreshToken();
  }

  refreshAccessToken(): Observable<LoginResponse<TUser>> {
    const isCookieRefresh = this.config.refreshMode === 'cookie';
    const body = isCookieRefresh ? {} : { refreshToken: this.getRefreshToken() };

    return this.http
      .post<LoginResponse<TUser>>(this.config.refreshUrl, body, {
        withCredentials: isCookieRefresh || this.config.withCredentials,
      })
      .pipe(
        tap((response) => {
          const newToken = response?.accessToken || (response as any)?.access_token;
          if (newToken) {
            this.setToken(newToken);
            const newRefreshToken = response?.refreshToken || (response as any)?.refresh_token;
            if (newRefreshToken) {
              this.setRefreshToken(newRefreshToken);
            }
          }
        }),
        catchError((error) => throwError(() => error))
      );
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  }

  hasRole(role: string): boolean {
    const user = this.getUser();
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  logout(): void {
    this.memoryToken = null;
    this.memoryRefreshToken = null;

    if (isPlatformBrowser(this.platformId)) {
      const storage = this.config.tokenStorage === 'sessionStorage' ? sessionStorage : localStorage;
      storage.removeItem(this.config.tokenName);
      storage.removeItem(`${this.config.tokenName}_user`);
      this.removeRefreshToken();
    }
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }
}


