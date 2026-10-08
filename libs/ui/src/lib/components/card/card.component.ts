import {
  Component,
  Input,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() elevated = true;
  @Input() bordered = true;
  @Input() noPadding = false;
  @Input() hasHeader = false;
  @Input() hasFooter = false;
  @Input() headerIcon = false;
  @Input() hasHeaderExtra = false;
  @Input() fullHeight = false;

  @HostBinding('class.h-full')
  @HostBinding('class.flex-1')
  get isFullHeight(): boolean {
    return this.fullHeight;
  }

  get hostClass(): string {
    const base = 'bg-white rounded-xl overflow-hidden transition-shadow';
    const border = this.bordered ? 'border border-gray-200' : '';
    const shadow = this.elevated ? 'shadow-xs hover:shadow-sm' : '';
    const height = this.fullHeight ? 'h-full flex-1 flex flex-col' : '';
    return [base, border, shadow, height].filter(Boolean).join(' ');
  }

  get bodyClass(): string {
    const padding = this.noPadding ? '' : 'p-6';
    const flex = this.fullHeight ? 'flex-1 flex flex-col' : '';
    return [padding, flex].filter(Boolean).join(' ');
  }
}

