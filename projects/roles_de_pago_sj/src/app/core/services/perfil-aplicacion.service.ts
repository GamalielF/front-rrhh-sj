import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { AuthService } from '@lumen/auth';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { ApiResponse, PerfilResponse } from '../models';

@Injectable({ providedIn: 'root' })
export class PerfilAplicacionService {
  private api = inject(ApiService);
  private authService = inject(AuthService);
  private cache: { usuario: string; perfil$: Observable<PerfilResponse | null> } | null = null;

  perfil(): Observable<PerfilResponse | null> {
    const usuario = this.authService.getUser()?.username ?? this.authService.getUsernameFromToken() ?? '';
    if (this.cache?.usuario !== usuario) {
      this.cache = { usuario, perfil$: this.cargar().pipe(shareReplay(1)) };
    }
    return this.cache.perfil$;
  }

  private cargar(): Observable<PerfilResponse | null> {
    return this.api.get<ApiResponse<PerfilResponse>>(`${env.rolesPagoApiUrl}mi-perfil`).pipe(
      map(({ content }) => content),
      catchError(() => {
        this.cache = null;
        return of(null);
      }),
    );
  }
}
