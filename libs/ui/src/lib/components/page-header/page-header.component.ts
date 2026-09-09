import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent, BadgeVariant } from '../badge';

@Component({
  selector: 'ui-page-header',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.css'],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() category = '';
  @Input() icon = '';
  @Input() badgeText = '';
  @Input() badgeVariant: BadgeVariant = 'primary';
  @Input() hasFilters = false;
}
