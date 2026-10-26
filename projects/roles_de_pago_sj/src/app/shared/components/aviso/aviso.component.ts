import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { VarianteAviso } from './aviso.model';

@Component({
  selector: 'app-aviso',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './aviso.component.html',
  styleUrls: ['./aviso.component.css'],
})
export class AvisoComponent {
  readonly variante = input<VarianteAviso>('info');
}
