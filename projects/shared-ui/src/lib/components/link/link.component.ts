import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbService } from '../breadcrumb/breadcrumb.service';

export type LinkVariant = 'brand' | 'primary' | 'secondary' | 'muted';
export type LinkSize = 'xs' | 'sm' | 'md';

@Component({
  selector: 'ui-link',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
})
export class LinkComponent {
  private readonly breadcrumbService = inject(BreadcrumbService, { optional: true });

  @Input() routerLink?: string | any[];
  @Input() href?: string;
  @Input() target = '_self';
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';
  @Input() size: LinkSize = 'sm';
  @Input() variant: LinkVariant = 'brand';
  @Input() traceKey?: string;
  @Input() traceLabel?: string;

  @Output() linkClick = new EventEmitter<MouseEvent>();

  get variantClasses(): string {
    switch (this.variant) {
      case 'primary':
        return 'text-blue-600 hover:text-blue-800';
      case 'secondary':
        return 'text-slate-700 hover:text-slate-900';
      case 'muted':
        return 'text-gray-500 hover:text-gray-700';
      case 'brand':
      default:
        return 'text-[#0061A1] hover:text-[#004d80]';
    }
  }

  get sizeClasses(): string {
    switch (this.size) {
      case 'xs':
        return 'text-xs gap-1';
      case 'md':
        return 'text-base gap-2';
      case 'sm':
      default:
        return 'text-sm gap-1.5';
    }
  }

  onClick(event: MouseEvent): void {
    if (this.traceKey && this.traceLabel && this.breadcrumbService) {
      this.breadcrumbService.setLabel(this.traceKey, this.traceLabel);
    }
    this.linkClick.emit(event);
  }
}
