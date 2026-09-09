import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PageContainerComponent,
  CardComponent,
  ButtonComponent,
} from '@lumen/ui';

@Component({
  selector: 'lumen-home',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    CardComponent,
    ButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class LumenHomeComponent {
  @Input() title = 'Inicio';
  @Input() description = 'Bienvenido al portal institucional';
  @Input() docsUrl = 'https://docs.coopsanjose.fin.ec';

  openDocs(): void {
    window.open(this.docsUrl, '_blank', 'noopener,noreferrer');
  }
}
