import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

const SIZE_MAP: Record<string, string> = {
  sm:   'w-full max-w-sm',
  md:   'w-full max-w-lg',
  lg:   'w-full max-w-2xl',
  xl:   'w-full max-w-4xl',
  full: 'w-full max-w-full m-4',
};

@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'md';
  @Input() showClose = true;
  @Input() closeOnBackdrop = true;
  @Input() hasFooter = true;

  @Output() close = new EventEmitter<void>();

  get panelClass(): string {
    return [
      'bg-white rounded-2xl border border-gray-200 shadow-xl',
      'flex flex-col max-h-[90vh] overflow-hidden transition-all',
      SIZE_MAP[this.size] || SIZE_MAP['md'],
    ].join(' ');
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.close.emit();
  }
}
