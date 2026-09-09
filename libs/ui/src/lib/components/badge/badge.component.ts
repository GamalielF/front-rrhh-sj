import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BadgeVariant, BadgeSize, BadgeShape } from './badge.model';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-blue-50 text-[#1D4ED8] border border-blue-200 font-medium',
  info:    'bg-sky-50 text-sky-800 border border-sky-200 font-medium',
  warning: 'bg-amber-50 text-[#92400E] border border-amber-200 font-medium',
  danger:  'bg-red-50 text-[#991B1B] border border-red-200 font-medium',
  success: 'bg-emerald-50 text-[#065F46] border border-emerald-200 font-medium',
  neutral: 'bg-gray-100 text-gray-800 border border-gray-200 font-medium',
  brand:   'bg-emerald-50 text-[#166534] border border-emerald-200 font-medium',
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'bg-[#3B82F6]',
  info:    'bg-sky-500',
  warning: 'bg-[#D97706]',
  danger:  'bg-[#DC2626]',
  success: 'bg-[#16A34A]',
  neutral: 'bg-gray-400',
  brand:   'bg-[#4CA42F]',
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[11px] leading-tight',
  sm: 'px-2.5 py-0.5 text-xs leading-none',
  md: 'px-3 py-1 text-xs leading-normal',
  lg: 'px-3.5 py-1.5 text-sm leading-normal',
};

@Component({
  selector: 'ui-badge',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.css'],
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'info';
  @Input() size: BadgeSize = 'md';
  @Input() shape: BadgeShape = 'pill';
  @Input() showDot = false;
  @Input() value?: string | number;

  get badgeClass(): string {
    const radiusClass = this.shape === 'pill' ? 'rounded-full' : 'rounded-md';
    return [
      'inline-flex items-center justify-center whitespace-nowrap tracking-tight transition-colors',
      radiusClass,
      VARIANT_CLASSES[this.variant] || VARIANT_CLASSES['info'],
      SIZE_CLASSES[this.size] || SIZE_CLASSES['md'],
    ].join(' ');
  }

  get dotClass(): string {
    return DOT_CLASSES[this.variant] || DOT_CLASSES['info'];
  }
}
