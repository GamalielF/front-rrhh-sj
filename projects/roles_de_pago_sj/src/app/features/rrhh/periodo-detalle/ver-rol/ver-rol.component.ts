import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, output, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonComponent, InputComponent, ModalComponent } from '@lumen/ui';
import { AvisoComponent, VisorPdfComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import type { RolPagoPdfResponse } from '@models';
import type { RolFila } from '../../rrhh.model';
import { RrhhService } from '../../rrhh.service';
import { MENSAJES_MOTIVO, MOTIVO_MAXIMO, MOTIVO_MINIMO } from './ver-rol.model';

@Component({
  selector: 'app-ver-rol',
  standalone: true,
  imports: [ReactiveFormsModule, AvisoComponent, ButtonComponent, InputComponent, ModalComponent, VisorPdfComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ver-rol.component.html',
  styleUrls: ['./ver-rol.component.css'],
})
export class VerRolComponent {
  private servicio = inject(RrhhService);
  private destroyRef = inject(DestroyRef);

  readonly periodo = input.required<string>();
  readonly rol = input<RolFila | null>(null);
  readonly cerrado = output<void>();

  readonly mensajesMotivo = MENSAJES_MOTIVO;
  readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(MOTIVO_MINIMO), Validators.maxLength(MOTIVO_MAXIMO)],
  });

  readonly consultando = signal(false);
  readonly error = signal('');
  readonly pdf = signal<RolPagoPdfResponse | null>(null);

  constructor() {
    effect(() => {
      this.rol();
      untracked(() => this.reiniciar());
    });
  }

  consultar(): void {
    const rol = this.rol();
    this.motivo.markAsTouched();
    if (!rol || this.motivo.invalid || this.consultando()) {
      return;
    }
    this.error.set('');
    this.consultando.set(true);
    this.servicio
      .verRol(this.periodo(), rol.id, this.motivo.value.trim())
      .pipe(
        finalize(() => this.consultando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (pdf) => this.pdf.set(pdf),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  cerrar(): void {
    this.cerrado.emit();
  }

  private reiniciar(): void {
    this.motivo.reset('');
    this.error.set('');
    this.pdf.set(null);
  }
}
