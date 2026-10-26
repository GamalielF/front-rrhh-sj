import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, ModalComponent } from '@lumen/ui';
import { AvisoComponent } from '../aviso';

@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css'],
})
export class ConfirmacionComponent {
  readonly abierta = input(false);
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly mensaje = input('');
  readonly etiquetaConfirmar = input('Confirmar');
  readonly peligro = input(false);
  readonly procesando = input(false);
  readonly error = input('');

  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
