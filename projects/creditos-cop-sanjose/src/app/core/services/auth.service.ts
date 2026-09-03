import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BehaviorSubject, tap, Observable } from 'rxjs';
import { LoginResponse } from '@models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());

  token$ = this.tokenSubject.asObservable();

  login(usuario: string, contrasenia: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(environment.loginUrl, {
      username: usuario,
      password: contrasenia
    }).pipe(
      tap(response => {
        if (response.accessToken) {
          this.setToken(response.accessToken);
        }
      })
    );
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
    }
    this.tokenSubject.next(null);
  }

  private setToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token);
    }
    this.tokenSubject.next(token);
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
