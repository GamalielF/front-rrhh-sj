import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type {
  ApiResponse,
  ListadoPeriodoResponse,
  PeriodoResumenResponse,
  PublicacionResponse,
  PublicarPeriodoRequest,
  ResumenPeriodoResponse,
} from '@models';

@Injectable({ providedIn: 'root' })
export class RrhhService {
  private api = inject(ApiService);

  periodos(): Observable<PeriodoResumenResponse[]> {
    return this.obtener<PeriodoResumenResponse[]>('rrhh/periodos');
  }

  listado(periodo: string): Observable<ListadoPeriodoResponse> {
    return this.obtener<ListadoPeriodoResponse>(`rrhh/periodos/${periodo}/roles-pago`);
  }

  resumen(periodo: string): Observable<ResumenPeriodoResponse> {
    return this.obtener<ResumenPeriodoResponse>(`rrhh/periodos/${periodo}/resumen`);
  }

  publicar(periodo: string, solicitud: PublicarPeriodoRequest): Observable<PublicacionResponse> {
    return this.api
      .post<ApiResponse<PublicacionResponse>>(`${env.rolesPagoApiUrl}rrhh/periodos/${periodo}/publicar`, solicitud)
      .pipe(map(({ content }) => content));
  }

  private obtener<T>(ruta: string): Observable<T> {
    return this.api.get<ApiResponse<T>>(`${env.rolesPagoApiUrl}${ruta}`).pipe(map(({ content }) => content));
  }
}
