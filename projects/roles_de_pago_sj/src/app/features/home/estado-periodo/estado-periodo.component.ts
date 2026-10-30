import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent } from '@lumen/ui';
import { AvisoComponent, ErrorCargaComponent } from '@components';
import { formatearPeriodo, mensajeDeError } from '@core/utils';
import { periodoActual } from '../../rrhh';
import { Indicador } from '../home.model';
import { EstadoPeriodoService, EstadoReciente } from './estado-periodo.service';
import { indicadoresDe } from './estado-periodo.util';

@Component({
  selector: 'app-estado-periodo',
  standalone: true,
  imports: [AvisoComponent, BadgeComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent, ErrorCargaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './estado-periodo.component.html',
  styleUrls: ['./estado-periodo.component.css'],
})
export class EstadoPeriodoComponent {
  private servicio = inject(EstadoPeriodoService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly actual = periodoActual(new Date());
  readonly mesActual = formatearPeriodo(this.actual);

  readonly estado = signal<EstadoReciente | null>(null);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly mes = computed(() => {
    const periodo = this.estado()?.periodo;
    return periodo ? formatearPeriodo(periodo) : '';
  });
  readonly publicado = computed(() => this.estado()?.resumen?.estadoPeriodo === 'PUBLICADO');
  readonly indicadores = computed<Indicador[]>(() => {
    const estado = this.estado();
    return estado?.resumen ? indicadoresDe(estado.resumen, estado.cobertura, estado.informe) : [];
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.error.set('');
    this.cargando.set(true);
    this.servicio
      .cargar(new Date())
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (estado) => this.estado.set(estado),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  abrir(periodo: string): void {
    this.router.navigate(['/rrhh/periodos', periodo]);
  }
}
