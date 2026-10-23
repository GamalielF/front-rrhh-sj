import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PageContainerComponent,
  CardComponent,
  ButtonComponent,
} from '@lumen/ui';

@Component({
  selector: 'app-home',
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
export class HomeComponent {
  readonly docsUrl = 'https://docs.coopsanjose.fin.ec';

  openDocs(): void {
    window.open(this.docsUrl, '_blank', 'noopener,noreferrer');
  }
}
