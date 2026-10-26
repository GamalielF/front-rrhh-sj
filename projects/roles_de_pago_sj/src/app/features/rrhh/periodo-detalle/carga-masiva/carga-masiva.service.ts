import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { concatMap, map, scan } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { ApiResponse, ResultadoCargaResponse } from '@models';
import type { ProgresoCarga } from './carga-masiva.model';
import { acumularProgreso, progresoInicial } from './carga-masiva.util';

@Injectable({ providedIn: 'root' })
export class CargaMasivaService {
  private api = inject(ApiService);

  cargarEnLotes(periodo: string, lotes: File[][]): Observable<ProgresoCarga> {
    return from(lotes).pipe(
      concatMap((lote) => this.cargarLote(periodo, lote)),
      scan(acumularProgreso, progresoInicial(lotes.length)),
    );
  }

  private cargarLote(periodo: string, archivos: File[]): Observable<ResultadoCargaResponse> {
    const formulario = new FormData();
    archivos.forEach((archivo) => formulario.append('archivos', archivo, archivo.name));
    return this.api
      .post<ApiResponse<ResultadoCargaResponse>>(`${env.rolesPagoApiUrl}rrhh/periodos/${periodo}/roles-pago`, formulario)
      .pipe(map(({ content }) => content));
  }
}
