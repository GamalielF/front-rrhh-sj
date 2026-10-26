import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ButtonComponent, CardComponent, GridComponent, KpiCardComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import type { CoberturaPeriodoResponse } from '@models';
import { RrhhService } from '../../rrhh.service';
import { resumirNombres } from '../../rrhh.util';
import { porcentajeLeido } from './cobertura-periodo.util';

@Component({
  selector: 'app-cobertura-periodo',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cobertura-periodo.component.html',
  styleUrls: ['./cobertura-periodo.component.css'],
})
export class CoberturaPeriodoComponent {
  private servicio = inject(RrhhService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();

  readonly cobertura = signal<CoberturaPeriodoResponse | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  readonly porcentaje = computed(() => {
    const datos = this.cobertura();
    return datos ? porcentajeLeido(datos.leidos, datos.rolesPublicados) : 0;
  });
  readonly nombresPendientes = computed(() => resumirNombres(this.cobertura()?.nombresPendientes ?? [], 15));

  constructor() {
    effect(() => {
      const periodo = this.periodo();
      untracked(() => this.cargar(periodo));
    });
  }

  actualizar(): void {
    this.cargar(this.periodo());
  }

  private cargar(periodo: string): void {
    this.error.set('');
    this.cargando.set(true);
    this.servicio
      .cobertura(periodo)
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (cobertura) => this.cobertura.set(cobertura),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}
