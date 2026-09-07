import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';
import {
  DropdownItem,
  DropdownPlacement,
  DropdownTriggerSize,
  DropdownTriggerVariant,
} from './dropdown.model';
import {
  TRIGGER_BASE,
  TRIGGER_VARIANTS,
  TRIGGER_SIZES,
  TRIGGER_ICON_SIZES,
} from './dropdown.variant';

@Component({
  selector: 'ui-dropdown',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent {
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @Input() items: DropdownItem[] = [];
  @Input() triggerIcon = '@tui.ellipsis-vertical';
  @Input() triggerLabel = '';
  @Input() triggerVariant: DropdownTriggerVariant = 'ghost';
  @Input() triggerSize: DropdownTriggerSize = 'sm';
  @Input() triggerClass = '';
  @Input() menuClass = '';
  @Input() menuTitle = '';
  @Input() placement: DropdownPlacement = 'bottom-end';
  @Input() disabled = false;
  @Input() closeOnClick = true;
  @Input() ariaLabel = 'Opciones';

  @Output() itemClick = new EventEmitter<DropdownItem>();
  @Output() openChange = new EventEmitter<boolean>();

  isOpen = false;

  get triggerButtonClass(): string {
    const isIconOnly = !this.triggerLabel;
    return [
      TRIGGER_BASE,
      TRIGGER_VARIANTS[this.triggerVariant] || TRIGGER_VARIANTS.ghost,
      isIconOnly
        ? (TRIGGER_ICON_SIZES[this.triggerSize] || TRIGGER_ICON_SIZES.sm)
        : (TRIGGER_SIZES[this.triggerSize] || TRIGGER_SIZES.sm),
      this.isOpen ? 'ring-2 ring-[#3B82F6]/30 bg-gray-100 text-gray-900' : '',
      this.triggerClass,
    ]
      .filter(Boolean)
      .join(' ');
  }

  get placementClass(): string {
    switch (this.placement) {
      case 'bottom-start':
        return 'left-0 top-full mt-1.5 origin-top-left';
      case 'bottom-center':
        return 'left-1/2 -translate-x-1/2 top-full mt-1.5 origin-top';
      case 'top-end':
        return 'right-0 bottom-full mb-1.5 origin-bottom-right';
      case 'top-start':
        return 'left-0 bottom-full mb-1.5 origin-bottom-left';
      case 'top-center':
        return 'left-1/2 -translate-x-1/2 bottom-full mb-1.5 origin-bottom';
      case 'bottom-end':
      default:
        return 'right-0 top-full mt-1.5 origin-top-right';
    }
  }

  get visibleItems(): DropdownItem[] {
    return this.items.filter((item) => !item.hidden);
  }

  getItemVariantClass(item: DropdownItem): string {
    if (item.disabled) {
      return 'text-gray-400 cursor-not-allowed opacity-60';
    }

    switch (item.variant) {
      case 'danger':
        return 'text-red-600 hover:bg-red-50 hover:text-red-700 active:bg-red-100';
      case 'brand':
        return 'text-[#0061A1] hover:bg-blue-50 hover:text-[#004e82] active:bg-blue-100';
      case 'primary':
        return 'text-[#3B82F6] hover:bg-blue-50 hover:text-[#2563EB] active:bg-blue-100';
      case 'warning':
        return 'text-amber-600 hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100';
      case 'info':
        return 'text-sky-600 hover:bg-sky-50 hover:text-sky-700 active:bg-sky-100';
      case 'default':
      default:
        return 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100';
    }
  }

  getItemIconClass(item: DropdownItem): string {
    if (item.disabled) return 'text-gray-400';
    switch (item.variant) {
      case 'danger':
        return 'text-red-500';
      case 'brand':
        return 'text-[#0061A1]';
      case 'primary':
        return 'text-[#3B82F6]';
      case 'warning':
        return 'text-amber-500';
      case 'info':
        return 'text-sky-500';
      default:
        return 'text-gray-400 group-hover:text-gray-600';
    }
  }

  toggle(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
    this.cdr.markForCheck();
  }

  open(): void {
    if (this.disabled || this.isOpen) return;
    this.isOpen = true;
    this.openChange.emit(true);
    this.cdr.markForCheck();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.openChange.emit(false);
    this.cdr.markForCheck();
  }

  handleItemClick(item: DropdownItem, event: MouseEvent): void {
    event.stopPropagation();
    if (item.disabled) return;

    if (this.closeOnClick) {
      this.close();
    }

    if (item.onClick) {
      item.onClick(item);
    }
    this.itemClick.emit(item);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.close();
    }
  }
}
