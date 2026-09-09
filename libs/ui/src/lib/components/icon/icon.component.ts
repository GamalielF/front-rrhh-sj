import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiIcon } from '@taiga-ui/core';
import { IconSize } from './icon.model';

const SIZE_MAP: Record<IconSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-2xl',
};

@Component({
  selector: 'ui-icon',
  standalone: true,
  imports: [CommonModule, TuiIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.css'],
})
export class IconComponent {
  @Input({ required: true }) icon = '';
  @Input() size: IconSize = 'md';
  @Input() extraClass = '';

  get iconClasses(): string {
    return ['inline-flex items-center justify-center leading-none', SIZE_MAP[this.size], this.extraClass]
      .filter(Boolean)
      .join(' ');
  }
}
