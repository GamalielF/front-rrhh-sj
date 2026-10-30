import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent, PageContainerComponent } from '@lumen/ui';
import { AvisoComponent, ErrorCargaComponent } from '@components';
import { formatearFechaHora, mensajeDeError } from '@core/utils';
import type { EstadoDirectorioResponse, ResultadoSincronizacionResponse } from '@models';
import { BuscadorCedulaComponent } from './buscador-cedula';
import { DatoSincronizacion } from './directorio.model';
import { DirectorioService } from './directorio.service';
import { datosDeSincronizacion } from './directorio.util';

@Component({
  selector: 'app-directorio',
  standalone: true,
  imports: [
    AvisoComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    GridComponent,
    KpiCardComponent,
    PageContainerComponent,
    BuscadorCedulaComponent,
    ErrorCargaComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './directorio.component.html',
  styleUrls: ['./directorio.component.css'],
})
export class DirectorioComponent {
  private servicio = inject(DirectorioService);
  private destroyRef = inject(DestroyRef);

  readonly estado = signal<EstadoDirectorioResponse | null>(null);
  readonly sincronizando = signal(false);
  readonly datos = signal<DatoSincronizacion[]>([]);
  readonly error = signal('');

  readonly ultimaSincronizacion = computed(() => {
    const fecha = this.estado()?.ultimaSincronizacion;
    return fecha ? formatearFechaHora(fecha) : 'Nunca';
  });
  readonly ultimoResultado = computed(() => {
    const resultado = this.estado()?.resultadoUltima;
    return resultado === 'EXITOSA' ? 'Exitosa' : resultado === 'FALLIDA' ? 'Fallida' : '—';
  });

  constructor() {
    this.cargarEstado();
  }

  sincronizar(): void {
    if (this.sincronizando()) {
      return;
    }
    this.error.set('');
    this.sincronizando.set(true);
    this.servicio
      .sincronizar()
      .pipe(
        finalize(() => this.sincronizando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado: ResultadoSincronizacionResponse) => {
          this.datos.set(datosDeSincronizacion(resultado));
          this.cargarEstado();
        },
        error: (error: unknown) => {
          this.error.set(mensajeDeError(error));
          this.cargarEstado();
        },
      });
  }

  reintentarEstado(): void {
    this.error.set('');
    this.cargarEstado();
  }

  private cargarEstado(): void {
    this.servicio
      .estado()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (estado) => this.estado.set(estado),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}
