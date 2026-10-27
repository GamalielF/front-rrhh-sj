import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import type { CoberturaPeriodoResponse, InformeNotificacionesResponse, ResumenPeriodoResponse } from '@models';
import { NotificacionesService, RrhhService, periodoActual, periodoMasReciente } from '../../rrhh';

export interface EstadoReciente {
  periodo: string | null;
  existeActual: boolean;
  resumen: ResumenPeriodoResponse | null;
  cobertura: CoberturaPeriodoResponse | null;
  informe: InformeNotificacionesResponse | null;
}

@Injectable({ providedIn: 'root' })
export class EstadoPeriodoService {
  private rrhh = inject(RrhhService);
  private avisos = inject(NotificacionesService);

  cargar(hoy: Date): Observable<EstadoReciente> {
    const actual = periodoActual(hoy);
    return this.rrhh.periodos().pipe(
      switchMap((periodos) => {
        const periodo = periodoMasReciente(periodos);
        const existeActual = periodos.some((item) => item.periodo === actual);
        if (!periodo) {
          return of<EstadoReciente>({ periodo, existeActual, resumen: null, cobertura: null, informe: null });
        }
        return this.rrhh.resumen(periodo).pipe(
          switchMap((resumen) => {
            const publicado = resumen.estadoPeriodo === 'PUBLICADO';
            return forkJoin({
              cobertura: publicado ? this.rrhh.cobertura(periodo).pipe(catchError(() => of(null))) : of(null),
              informe: publicado ? this.avisos.informe(periodo).pipe(catchError(() => of(null))) : of(null),
            }).pipe(map(({ cobertura, informe }) => ({ periodo, existeActual, resumen, cobertura, informe })));
          }),
        );
      }),
    );
  }
}
