import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { CardComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { COLUMNAS_DENEGADOS, DenegadoFila, FiltrosAuditoria } from '../auditoria.model';
import { AuditoriaService } from '../auditoria.service';
import { aFilasDenegados } from '../auditoria.util';

@Component({
  selector: 'app-panel-denegados',
  standalone: true,
  imports: [AvisoComponent, CardComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-denegados.component.html',
  styleUrls: ['./panel-denegados.component.css'],
})
export class PanelDenegadosComponent {
  private servicio = inject(AuditoriaService);
  private destroyRef = inject(DestroyRef);
  private recarga$ = new Subject<void>();

  readonly filtros = input.required<FiltrosAuditoria>();

  readonly columnas = COLUMNAS_DENEGADOS;
  readonly filas = signal<DenegadoFila[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    this.recarga$
      .pipe(
        switchMap(() =>
          this.servicio.denegados(this.filtros()).pipe(
            map((respuesta) => ({ respuesta, fallo: null as unknown })),
            catchError((fallo: unknown) => of({ respuesta: null, fallo })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ respuesta, fallo }) => {
        this.cargando.set(false);
        if (respuesta) {
          this.error.set('');
          this.filas.set(aFilasDenegados(respuesta));
        } else {
          this.filas.set([]);
          this.error.set(mensajeDeError(fallo));
        }
      });

    effect(() => {
      this.filtros();
      untracked(() => {
        this.cargando.set(true);
        this.recarga$.next();
      });
    });
  }
}
