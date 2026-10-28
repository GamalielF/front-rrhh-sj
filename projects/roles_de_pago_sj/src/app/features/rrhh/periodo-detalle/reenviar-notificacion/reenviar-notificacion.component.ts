import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ConfirmacionComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { RolFila } from '../../rrhh.model';
import { NotificacionesService } from '../notificaciones-periodo/notificaciones-periodo.service';
import { ReenvioTerminado } from './reenviar-notificacion.model';
import { mensajeDeConfirmacion } from './reenviar-notificacion.util';

@Component({
  selector: 'app-reenviar-notificacion',
  standalone: true,
  imports: [ConfirmacionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reenviar-notificacion.component.html',
  styleUrls: ['./reenviar-notificacion.component.css'],
})
export class ReenviarNotificacionComponent {
  private servicio = inject(NotificacionesService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();
  readonly rol = input<RolFila | null>(null);
  readonly cerrado = output<void>();
  readonly reenviado = output<ReenvioTerminado>();

  readonly procesando = signal(false);
  readonly error = signal('');
  readonly mensaje = computed(() => {
    const fila = this.rol();
    return fila ? mensajeDeConfirmacion(fila) : '';
  });

  confirmar(): void {
    const fila = this.rol();
    if (!fila || this.procesando()) {
      return;
    }
    this.error.set('');
    this.procesando.set(true);
    this.servicio
      .reenviar(this.periodo(), fila.id)
      .pipe(
        finalize(() => this.procesando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.reenviado.emit({ fila, resultado });
          this.cerrado.emit();
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  cancelar(): void {
    if (this.procesando()) {
      return;
    }
    this.error.set('');
    this.cerrado.emit();
  }
}
