import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type {
  ApiResponse,
  CoberturaPeriodoResponse,
  ListadoPeriodoResponse,
  PeriodoResumenResponse,
  PublicacionResponse,
  PublicarPeriodoRequest,
  ResumenPeriodoResponse,
  RolPagoPdfResponse,
  RolPagoResumenResponse,
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
    return this.enviar<PublicacionResponse>(`rrhh/periodos/${periodo}/publicar`, solicitud);
  }

  cobertura(periodo: string): Observable<CoberturaPeriodoResponse> {
    return this.obtener<CoberturaPeriodoResponse>(`rrhh/periodos/${periodo}/cobertura`);
  }

  inactivarRol(periodo: string, idRol: number): Observable<RolPagoResumenResponse> {
    return this.enviar<RolPagoResumenResponse>(`rrhh/periodos/${periodo}/roles-pago/${idRol}/inactivar`, {});
  }

  activarRol(periodo: string, idRol: number): Observable<RolPagoResumenResponse> {
    return this.enviar<RolPagoResumenResponse>(`rrhh/periodos/${periodo}/roles-pago/${idRol}/activar`, {});
  }

  verRol(periodo: string, idRol: number, motivo: string): Observable<RolPagoPdfResponse> {
    return this.enviar<RolPagoPdfResponse>(`rrhh/periodos/${periodo}/roles-pago/${idRol}/ver`, { motivo });
  }

  private enviar<T>(ruta: string, cuerpo: unknown): Observable<T> {
    return this.api.post<ApiResponse<T>>(`${env.rolesPagoApiUrl}${ruta}`, cuerpo).pipe(map(({ content }) => content));
  }

  private obtener<T>(ruta: string): Observable<T> {
    return this.api.get<ApiResponse<T>>(`${env.rolesPagoApiUrl}${ruta}`).pipe(map(({ content }) => content));
  }
}
