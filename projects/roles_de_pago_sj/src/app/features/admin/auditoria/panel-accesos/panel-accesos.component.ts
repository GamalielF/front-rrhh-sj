import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, finalize, map, of, switchMap } from 'rxjs';
import { ButtonComponent, CardComponent, PaginationComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { base64ToBlob, descargarBlob, mensajeDeError } from '@core/utils';
import { AccesoFila, COLUMNAS_ACCESOS, FiltrosAuditoria, TAMANO_PAGINA } from '../auditoria.model';
import { AuditoriaService } from '../auditoria.service';
import { aFilasAccesos } from '../auditoria.util';

@Component({
  selector: 'app-panel-accesos',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent, CardComponent, PaginationComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-accesos.component.html',
  styleUrls: ['./panel-accesos.component.css'],
})
export class PanelAccesosComponent {
  private servicio = inject(AuditoriaService);
  private destroyRef = inject(DestroyRef);
  private recarga$ = new Subject<void>();

  readonly filtros = input.required<FiltrosAuditoria>();

  readonly columnas = COLUMNAS_ACCESOS;
  readonly filas = signal<AccesoFila[]>([]);
  readonly pagina = signal(0);
  readonly tamano = signal(TAMANO_PAGINA);
  readonly total = signal(0);
  readonly cargando = signal(true);
  readonly exportando = signal(false);
  readonly error = signal('');
  readonly aviso = signal('');
  readonly truncado = signal(false);

  constructor() {
    this.recarga$
      .pipe(
        switchMap(() =>
          this.servicio.accesos(this.filtros(), this.pagina(), this.tamano()).pipe(
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
          this.filas.set(aFilasAccesos(respuesta.elementos));
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
        this.aviso.set('');
        this.truncado.set(false);
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

  exportar(): void {
    this.error.set('');
    this.aviso.set('');
    this.exportando.set(true);
    this.servicio
      .exportarAccesos(this.filtros())
      .pipe(
        finalize(() => this.exportando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (archivo) => {
          descargarBlob(base64ToBlob(archivo.contenidoBase64, archivo.tipoContenido), archivo.nombreArchivo);
          this.truncado.set(archivo.truncado);
          this.aviso.set(
            archivo.truncado
              ? `El archivo trae solo las primeras ${archivo.filas} filas: acote el rango de fechas para obtener todo.`
              : `Se exportaron ${archivo.filas} filas.`,
          );
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  private recargar(): void {
    this.cargando.set(true);
    this.recarga$.next();
  }
}
