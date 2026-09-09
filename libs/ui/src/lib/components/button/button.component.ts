import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { ButtonVariant, ButtonSize } from './button.model';
import { BASE, VARIANT_CLASSES, SIZE_CLASSES } from './button.variant';

@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css'],
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() icon?: string;
  @Input() iconPosition: 'start' | 'end' = 'start';

  @Output() onClick = new EventEmitter<MouseEvent>();

  get buttonClass(): string {
    return [
      BASE,
      VARIANT_CLASSES[this.variant] || VARIANT_CLASSES['primary'],
      SIZE_CLASSES[this.size] || SIZE_CLASSES['md'],
    ].join(' ');
  }

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.onClick.emit(event);
    }
  }
}
