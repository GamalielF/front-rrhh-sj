import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';
import { fechaIso, restarDias } from '@core/utils';
import { FILTROS_VACIOS, AuditoriaService } from '../../admin/auditoria';
import { DirectorioService } from '../../admin/directorio';
import { AlertaAdmin, DIAS_DE_DENEGADOS, MINIMO_DENEGADOS } from '../home.model';
import { alertasDeDenegados, alertasDeDirectorio } from '../home.util';

export interface ResultadoAlertas {
  alertas: AlertaAdmin[];
  incompleto: boolean;
}

@Injectable({ providedIn: 'root' })
export class AlertasAdminService {
  private directorio = inject(DirectorioService);
  private auditoria = inject(AuditoriaService);

  cargar(hoy: Date): Observable<ResultadoAlertas> {
    const filtros = {
      ...FILTROS_VACIOS,
      desde: fechaIso(restarDias(hoy, DIAS_DE_DENEGADOS)),
      hasta: fechaIso(hoy),
      minimo: MINIMO_DENEGADOS,
    };
    return forkJoin({
      directorio: this.directorio.estado().pipe(catchError(() => of(null))),
      denegados: this.auditoria.denegados(filtros).pipe(catchError(() => of(null))),
    }).pipe(
      map(({ directorio, denegados }) => ({
        alertas: [
          ...(directorio ? alertasDeDirectorio(directorio, hoy) : []),
          ...(denegados ? alertasDeDenegados(denegados) : []),
        ],
        incompleto: directorio === null || denegados === null,
      })),
    );
  }
}
