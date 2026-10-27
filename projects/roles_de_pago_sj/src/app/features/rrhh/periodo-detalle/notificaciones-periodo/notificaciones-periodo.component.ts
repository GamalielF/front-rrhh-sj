import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, Subscription, finalize, timer } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import type { InformeNotificacionesResponse, ResultadoEncoladoResponse, ResultadoReintentoResponse } from '@models';
import { COLUMNAS_PROBLEMAS, INTERVALO_ACTUALIZACION_MS } from './notificaciones-periodo.model';
import { NotificacionesService } from './notificaciones-periodo.service';
import { aFilasProblemas, firmaDe, hayEnviosPendientes } from './notificaciones-periodo.util';

@Component({
  selector: 'app-notificaciones-periodo',
  standalone: true,
  imports: [AvisoComponent, BadgeComponent, ButtonComponent, CardComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notificaciones-periodo.component.html',
  styleUrls: ['./notificaciones-periodo.component.css'],
})
export class NotificacionesPeriodoComponent {
  private servicio = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);
  private temporizador: Subscription | null = null;
  private firma: string | null = null;

  readonly periodo = input.required<string>();
  readonly cambio = output<void>();

  readonly columnas = COLUMNAS_PROBLEMAS;
  readonly informe = signal<InformeNotificacionesResponse | null>(null);
  readonly cargando = signal(false);
  readonly trabajando = signal(false);
  readonly error = signal('');
  readonly mensaje = signal('');

  readonly problemas = computed(() => aFilasProblemas(this.informe()?.problemas ?? []));

  constructor() {
    effect(() => {
      const periodo = this.periodo();
      untracked(() => {
        this.firma = null;
        this.cargar(periodo);
      });
    });
  }

  actualizar(): void {
    this.mensaje.set('');
    this.cargar(this.periodo());
  }

  generar(): void {
    this.ejecutar(this.servicio.generar(this.periodo()), (resultado: ResultadoEncoladoResponse) =>
      `Avisos nuevos: ${resultado.creadas}. Ya existían ${resultado.yaExistentes}; sin correo, ${resultado.omitidas}.`,
    );
  }

  reintentar(): void {
    this.ejecutar(this.servicio.reintentar(this.periodo()), (resultado: ResultadoReintentoResponse) =>
      `Se devolvieron ${resultado.reintentadas} avisos a la cola para reintentarlos.`,
    );
  }

  private ejecutar<T>(operacion: Observable<T>, describir: (resultado: T) => string): void {
    this.error.set('');
    this.mensaje.set('');
    this.trabajando.set(true);
    operacion
      .pipe(
        finalize(() => this.trabajando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.mensaje.set(describir(resultado));
          this.cargar(this.periodo());
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  private cargar(periodo: string): void {
    this.temporizador?.unsubscribe();
    this.cargando.set(true);
    this.servicio
      .informe(periodo)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (informe) => {
          this.error.set('');
          this.informe.set(informe);
          this.avisarSiCambio(informe);
          this.programarActualizacion(informe);
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  private avisarSiCambio(informe: InformeNotificacionesResponse): void {
    const firma = firmaDe(informe);
    if (this.firma !== null && this.firma !== firma) {
      this.cambio.emit();
    }
    this.firma = firma;
  }

  private programarActualizacion(informe: InformeNotificacionesResponse): void {
    if (hayEnviosPendientes(informe)) {
      this.temporizador = timer(INTERVALO_ACTUALIZACION_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.cargar(this.periodo()));
    }
  }
}
