import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '@lumen/ui';
import { AvisoComponent } from '../aviso';

@Component({
  selector: 'app-error-carga',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-carga.component.html',
  styleUrls: ['./error-carga.component.css'],
})
export class ErrorCargaComponent {
  readonly mensaje = input.required<string>();
  readonly etiqueta = input('Volver a cargar');
  readonly reintentar = output<void>();
}
