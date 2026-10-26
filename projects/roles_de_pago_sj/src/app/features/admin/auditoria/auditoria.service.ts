import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type {
  AccesoAuditoriaResponse,
  AccionAuditoriaResponse,
  ApiResponse,
  ArchivoDescargaResponse,
  DenegadosPorUsuarioResponse,
  PaginaResponse,
} from '@models';
import { FiltrosAuditoria } from './auditoria.model';
import { parametrosDe } from './auditoria.util';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private api = inject(ApiService);

  accesos(filtros: FiltrosAuditoria, pagina: number, tamano: number): Observable<PaginaResponse<AccesoAuditoriaResponse>> {
    return this.consultar<PaginaResponse<AccesoAuditoriaResponse>>('accesos', { ...parametrosDe(filtros, 'accesos'), pagina, tamano });
  }

  acciones(filtros: FiltrosAuditoria, pagina: number, tamano: number): Observable<PaginaResponse<AccionAuditoriaResponse>> {
    return this.consultar<PaginaResponse<AccionAuditoriaResponse>>('acciones', { ...parametrosDe(filtros, 'acciones'), pagina, tamano });
  }

  denegados(filtros: FiltrosAuditoria): Observable<DenegadosPorUsuarioResponse[]> {
    return this.consultar<DenegadosPorUsuarioResponse[]>('denegados', parametrosDe(filtros, 'denegados'));
  }

  exportarAccesos(filtros: FiltrosAuditoria): Observable<ArchivoDescargaResponse> {
    return this.consultar<ArchivoDescargaResponse>('accesos/exportar', parametrosDe(filtros, 'accesos'));
  }

  private consultar<T>(ruta: string, params: Record<string, string | number>): Observable<T> {
    return this.api
      .get<ApiResponse<T>>(`${env.rolesPagoApiUrl}admin/auditoria/${ruta}`, { params })
      .pipe(map(({ content }) => content));
  }
}
