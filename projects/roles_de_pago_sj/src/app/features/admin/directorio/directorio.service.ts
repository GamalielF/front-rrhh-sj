import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type {
  ApiResponse,
  BusquedaDirectorioRequest,
  EstadoDirectorioResponse,
  PerfilDirectorioResponse,
  ResultadoSincronizacionResponse,
} from '@models';

@Injectable({ providedIn: 'root' })
export class DirectorioService {
  private api = inject(ApiService);

  estado(): Observable<EstadoDirectorioResponse> {
    return this.api
      .get<ApiResponse<EstadoDirectorioResponse>>(`${env.rolesPagoApiUrl}admin/directorio/estado`)
      .pipe(map(({ content }) => content));
  }

  sincronizar(): Observable<ResultadoSincronizacionResponse> {
    return this.api
      .post<ApiResponse<ResultadoSincronizacionResponse>>(`${env.rolesPagoApiUrl}admin/directorio/sincronizar`, {})
      .pipe(map(({ content }) => content));
  }

  buscarPorCedula(cedula: string): Observable<PerfilDirectorioResponse[]> {
    const solicitud: BusquedaDirectorioRequest = { cedula };
    return this.api
      .post<ApiResponse<PerfilDirectorioResponse[]>>(`${env.rolesPagoApiUrl}admin/directorio/buscar`, solicitud)
      .pipe(map(({ content }) => content));
  }
}
