import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonComponent, CardComponent } from '@lumen/ui';
import { ErrorCargaComponent } from '@components';
import { formatearPeriodo, mensajeDeError } from '@core/utils';
import { MiRolPagoService } from '../../mi-rol-pago';

@Component({
  selector: 'app-rol-reciente',
  standalone: true,
  imports: [ButtonComponent, CardComponent, ErrorCargaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rol-reciente.component.html',
  styleUrls: ['./rol-reciente.component.css'],
})
export class RolRecienteComponent {
  private servicio = inject(MiRolPagoService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly periodos = signal<string[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');

  readonly ultimo = computed(() => this.periodos()[0] ?? null);
  readonly etiqueta = computed(() => {
    const ultimo = this.ultimo();
    return ultimo ? formatearPeriodo(ultimo) : '';
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.error.set('');
    this.cargando.set(true);
    this.servicio
      .periodos()
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (periodos) => this.periodos.set(periodos),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  abrir(): void {
    this.router.navigate(['/mi-rol'], { queryParams: { periodo: this.ultimo() } });
  }
}
