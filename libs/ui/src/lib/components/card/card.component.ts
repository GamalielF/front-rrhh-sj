import {
  Component,
  Input,
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

  get hostClass(): string {
    const base = 'bg-white rounded-xl overflow-hidden transition-shadow';
    const border = this.bordered ? 'border border-gray-200' : '';
    const shadow = this.elevated ? 'shadow-xs hover:shadow-sm' : '';
    return [base, border, shadow].filter(Boolean).join(' ');
  }

  get bodyClass(): string {
    return this.noPadding ? '' : 'p-6';
  }
}
