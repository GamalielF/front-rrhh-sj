import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { concatMap, map, scan } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { ApiResponse, ResultadoCargaResponse } from '@models';
import type { OpcionesCarga, ProgresoCarga } from './carga-masiva.model';
import { acumularProgreso, progresoInicial } from './carga-masiva.util';

@Injectable({ providedIn: 'root' })
export class CargaMasivaService {
  private api = inject(ApiService);

  cargarEnLotes(periodo: string, lotes: File[][], opciones: OpcionesCarga = {}): Observable<ProgresoCarga> {
    return from(lotes).pipe(
      concatMap((lote) => this.cargarLote(periodo, lote, opciones)),
      scan(acumularProgreso, progresoInicial(lotes.length)),
    );
  }

  private cargarLote(periodo: string, archivos: File[], opciones: OpcionesCarga): Observable<ResultadoCargaResponse> {
    const formulario = new FormData();
    archivos.forEach((archivo) => formulario.append('archivos', archivo, archivo.name));
    // Como campos del formulario y no en la dirección: así el motivo no queda en los registros del servidor
    if (opciones.simular) {
      formulario.append('simular', 'true');
    }
    if (opciones.motivo) {
      formulario.append('motivo', opciones.motivo);
    }
    return this.api
      .post<ApiResponse<ResultadoCargaResponse>>(`${env.rolesPagoApiUrl}rrhh/periodos/${periodo}/roles-pago`, formulario)
      .pipe(map(({ content }) => content));
  }
}
