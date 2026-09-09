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
} from 'rxjs';
import { LoginCredentials, LoginResponse, UserSession, AuthConfig } from '../models/auth.models';
import { AUTH_CONFIG, DEFAULT_AUTH_CONFIG } from '../tokens/auth.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private config: Required<AuthConfig> = {
    ...DEFAULT_AUTH_CONFIG,
    ...(inject(AUTH_CONFIG, { optional: true }) || {}),
  };

  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private userSubject = new BehaviorSubject<UserSession | null>(this.getUser());

  readonly token$ = this.tokenSubject.asObservable();
  readonly user$ = this.userSubject.asObservable();
  readonly isAuthenticated$ = this.tokenSubject.pipe(map((token) => !!token));

  login(username: string, password: string, customUrl?: string): Observable<LoginResponse> {
    const url = customUrl || this.config.loginUrl;
    const payload = {
      username,
      password,
    };

    return this.http.post<LoginResponse>(url, payload).pipe(
      tap((response) => {
        const token = response.accessToken || response.token;
        if (token) {
          const user = response.user || { username: payload.username };
          this.setSession(token, user, response.refreshToken);
        }
      }),
      catchError((error) => throwError(() => error))
    );
  }

  setSession(token: string, user?: UserSession, refreshToken?: string): void {
    this.setToken(token);
    if (user) {
      this.setUser(user);
    }
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.config.tokenName, token);
    }
    this.tokenSubject.next(token);
  }

  private setUser(user: UserSession): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`${this.config.tokenName}_user`, JSON.stringify(user));
    }
    this.userSubject.next(user);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.config.tokenName);
    }
    return null;
  }

  getUser(): UserSession | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const raw = localStorage.getItem(`${this.config.tokenName}_user`);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserSession;
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(`${this.config.tokenName}_refresh`);
  }

  private setRefreshToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`${this.config.tokenName}_refresh`, token);
    }
  }

  private removeRefreshToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(`${this.config.tokenName}_refresh`);
    }
  }

  refreshAccessToken(): Observable<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<LoginResponse>(this.config.refreshUrl, { refreshToken })
      .pipe(
        tap((response) => {
          const newToken = response.accessToken || response.token;
          if (newToken) {
            this.setToken(newToken);
            if (response.refreshToken) {
              this.setRefreshToken(response.refreshToken);
            }
          }
        }),
        catchError((error) => throwError(() => error))
      );
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
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
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.config.tokenName);
      localStorage.removeItem(`${this.config.tokenName}_user`);
      this.removeRefreshToken();
    }
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }
}
