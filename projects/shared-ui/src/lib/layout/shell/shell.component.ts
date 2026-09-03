import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'ui-shell',
  standalone: true,
  imports: [CommonModule, TopbarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss'],
})
export class ShellComponent {
  @Input() logoSrc = '/logo-blue.png';
  @Input() appTitle = '';
  @Input() showTitle = false;
  @Input() hasSidebar = false;
  @Input() hasFooter = false;
}
