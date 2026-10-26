import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BadgeComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent, ModalComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { formatearPeriodo, mensajeDeError } from '@core/utils';
import type { PublicacionResponse, ResumenPeriodoResponse } from '@models';
import { RrhhService } from '../../rrhh.service';
import { resumirNombres } from '../../rrhh.util';

@Component({
  selector: 'app-resumen-periodo',
  standalone: true,
  imports: [AvisoComponent, BadgeComponent, ButtonComponent, CardComponent, GridComponent, KpiCardComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resumen-periodo.component.html',
  styleUrls: ['./resumen-periodo.component.css'],
})
export class ResumenPeriodoComponent {
  private servicio = inject(RrhhService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();
  readonly resumen = input<ResumenPeriodoResponse | null>(null);
  readonly publicado = output<void>();

  readonly confirmando = signal(false);
  readonly publicando = signal(false);
  readonly error = signal('');
  readonly resultado = signal<PublicacionResponse | null>(null);

  readonly mes = computed(() => formatearPeriodo(this.periodo()));
  readonly estaPublicado = computed(() => this.resumen()?.estadoPeriodo === 'PUBLICADO');
  readonly puedePublicar = computed(() => (this.resumen()?.rolesActivos ?? 0) > 0 && !this.estaPublicado());
  readonly hayDiferencias = computed(() => {
    const resumen = this.resumen();
    return (resumen?.sinRol ?? 0) > 0 || (resumen?.rolesSinPersonaActiva ?? 0) > 0;
  });
  readonly nombresSinRol = computed(() => resumirNombres(this.resumen()?.nombresSinRol ?? [], 8));
  readonly nombresRolesSinPersona = computed(() => resumirNombres(this.resumen()?.nombresRolesSinPersona ?? [], 8));

  abrirConfirmacion(): void {
    this.error.set('');
    this.confirmando.set(true);
  }

  cerrarConfirmacion(): void {
    if (!this.publicando()) {
      this.confirmando.set(false);
    }
  }

  publicar(): void {
    this.error.set('');
    this.publicando.set(true);
    this.servicio
      .publicar(this.periodo(), this.hayDiferencias() ? { confirmarFaltantes: true } : {})
      .pipe(
        finalize(() => this.publicando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.resultado.set(resultado);
          this.confirmando.set(false);
          this.publicado.emit();
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}
