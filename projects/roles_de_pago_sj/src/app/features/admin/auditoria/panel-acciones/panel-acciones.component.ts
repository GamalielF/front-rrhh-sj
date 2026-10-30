import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { CardComponent, PaginationComponent, TableComponent } from '@lumen/ui';
import { ErrorCargaComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { AccionFila, COLUMNAS_ACCIONES, FiltrosAuditoria, TAMANO_PAGINA } from '../auditoria.model';
import { AuditoriaService } from '../auditoria.service';
import { aFilasAcciones } from '../auditoria.util';

@Component({
  selector: 'app-panel-acciones',
  standalone: true,
  imports: [CardComponent, PaginationComponent, TableComponent, ErrorCargaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-acciones.component.html',
  styleUrls: ['./panel-acciones.component.css'],
})
export class PanelAccionesComponent {
  private servicio = inject(AuditoriaService);
  private destroyRef = inject(DestroyRef);
  private recarga$ = new Subject<void>();

  readonly filtros = input.required<FiltrosAuditoria>();

  readonly columnas = COLUMNAS_ACCIONES;
  readonly filas = signal<AccionFila[]>([]);
  readonly pagina = signal(0);
  readonly tamano = signal(TAMANO_PAGINA);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    this.recarga$
      .pipe(
        switchMap(() =>
          this.servicio.acciones(this.filtros(), this.pagina(), this.tamano()).pipe(
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
          this.filas.set(aFilasAcciones(respuesta.elementos));
          this.total.set(respuesta.totalElementos);
        } else {
          this.filas.set([]);
          this.total.set(0);
          this.error.set(mensajeDeError(fallo));
        }
      });

    effect(() => {
      this.filtros();
      untracked(() => {
        this.pagina.set(0);
        this.recargar();
      });
    });
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.recargar();
  }

  cambiarTamano(tamano: number): void {
    this.tamano.set(tamano);
    this.pagina.set(0);
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.recarga$.next();
  }
}
