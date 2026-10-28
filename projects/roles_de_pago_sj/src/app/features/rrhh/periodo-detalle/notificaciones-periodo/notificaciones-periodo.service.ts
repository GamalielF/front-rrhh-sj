import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type {
  ApiResponse,
  InformeNotificacionesResponse,
  ResultadoEncoladoResponse,
  ResultadoReenvioResponse,
  ResultadoReintentoResponse,
} from '@models';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private api = inject(ApiService);

  informe(periodo: string): Observable<InformeNotificacionesResponse> {
    return this.api
      .get<ApiResponse<InformeNotificacionesResponse>>(this.ruta(periodo))
      .pipe(map(({ content }) => content));
  }

  generar(periodo: string): Observable<ResultadoEncoladoResponse> {
    return this.api
      .post<ApiResponse<ResultadoEncoladoResponse>>(`${this.ruta(periodo)}/generar`, {})
      .pipe(map(({ content }) => content));
  }

  reintentar(periodo: string): Observable<ResultadoReintentoResponse> {
    return this.api
      .post<ApiResponse<ResultadoReintentoResponse>>(`${this.ruta(periodo)}/reintentar`, {})
      .pipe(map(({ content }) => content));
  }

  reenviar(periodo: string, rolId: number): Observable<ResultadoReenvioResponse> {
    return this.api
      .post<ApiResponse<ResultadoReenvioResponse>>(`${this.ruta(periodo)}/${rolId}/reenviar`, {})
      .pipe(map(({ content }) => content));
  }

  private ruta(periodo: string): string {
    return `${env.rolesPagoApiUrl}rrhh/periodos/${periodo}/notificaciones`;
  }
}
