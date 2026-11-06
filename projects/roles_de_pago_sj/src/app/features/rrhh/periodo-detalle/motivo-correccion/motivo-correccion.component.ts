import { ChangeDetectionStrategy, Component, computed, effect, input, output, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, InputComponent, ModalComponent } from '@lumen/ui';
import { MOTIVO_MAXIMO, MOTIVO_MINIMO } from '../ver-rol/ver-rol.model';
import { type CambioConMotivo, MENSAJES_MOTIVO_CORRECCION, textosDelCambio } from './motivo-correccion.model';

/** Pide el motivo para retirar o reponer un rol de un período ya publicado. No llama al servidor: devuelve el motivo. */
@Component({
  selector: 'app-motivo-correccion',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, InputComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './motivo-correccion.component.html',
})
export class MotivoCorreccionComponent {
  readonly cambio = input<CambioConMotivo | null>(null);
  readonly confirmado = output<string>();
  readonly cancelado = output<void>();

  readonly mensajesMotivo = MENSAJES_MOTIVO_CORRECCION;
  readonly motivo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(MOTIVO_MINIMO), Validators.maxLength(MOTIVO_MAXIMO)],
  });
  readonly textos = computed(() => {
    const cambio = this.cambio();
    return cambio ? textosDelCambio(cambio) : null;
  });

  constructor() {
    effect(() => {
      this.cambio();
      untracked(() => this.motivo.reset(''));
    });
  }

  confirmar(): void {
    this.motivo.markAsTouched();
    if (this.motivo.invalid) {
      return;
    }
    this.confirmado.emit(this.motivo.value.trim());
  }
}
