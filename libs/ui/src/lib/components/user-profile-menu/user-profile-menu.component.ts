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
import { AvatarIconComponent } from '../avatar-icon/avatar-icon.component';
import { DropdownItem, DropdownPlacement } from '../dropdown/dropdown.model';
import { formatUserProfileName } from './user-profile-menu.util';
import {
  UserProfileData,
  UserProfileNameFormat,
} from './user-profile-menu.model';
import {
  USER_PROFILE_TRIGGER_BASE,
  USER_PROFILE_TRIGGER_OPEN_CLASS,
  USER_PROFILE_PANEL_BASE,
  USER_PROFILE_PLACEMENT_CLASSES,
  USER_PROFILE_ITEM_BASE,
  USER_PROFILE_ITEM_DISABLED_CLASS,
  USER_PROFILE_ITEM_VARIANTS,
  USER_PROFILE_ITEM_ICON_VARIANTS,
} from './user-profile-menu.variant';

@Component({
  selector: 'ui-user-profile-menu',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent, AvatarIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user-profile-menu.component.html',
  styleUrls: ['./user-profile-menu.component.css'],
})
export class UserProfileMenuComponent {
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @Input() user: UserProfileData | null = null;
  @Input() items: DropdownItem[] = [];
  @Input() nameFormat: UserProfileNameFormat = 'first-last';
  @Input() placement: DropdownPlacement = 'bottom-end';
  @Input() closeOnClick = true;
  @Input() avatarBgColor = 'bg-[#0061A1]';
  @Input() ariaLabel = 'Menú de usuario';

  @Output() itemClick = new EventEmitter<DropdownItem>();
  @Output() openChange = new EventEmitter<boolean>();

  isOpen = false;

  get fullName(): string {
    if (!this.user) return 'Usuario';
    return (this.user.name || this.user.username || 'Usuario').trim();
  }

  get triggerDisplayName(): string {
    return formatUserProfileName(this.user, this.nameFormat);
  }

  get displayName(): string {
    return this.fullName;
  }

  get displayUsername(): string {
    if (!this.user) return '';
    if (this.user.username && this.user.name && this.user.username !== this.user.name) {
      return `@${this.user.username}`;
    }
    return '';
  }

  get displayEmail(): string {
    return this.user?.email || '';
  }

  get displayRole(): string {
    if (!this.user) return '';
    if (this.user.role) return this.user.role;
    if (Array.isArray(this.user.roles) && this.user.roles.length > 0) {
      return this.user.roles[0];
    }
    return '';
  }

  get initials(): string {
    const name = this.fullName;
    if (!name || name === 'Usuario') return 'U';
    const parts = name.split(/\s+/);
    if (parts.length >= 4) {
      return (parts[0][0] + (parts[2]?.[0] || parts[1][0])).toUpperCase();
    }
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  get triggerButtonClass(): string {
    return [
      USER_PROFILE_TRIGGER_BASE,
      this.isOpen ? USER_PROFILE_TRIGGER_OPEN_CLASS : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  get panelClass(): string {
    return [
      USER_PROFILE_PANEL_BASE,
      USER_PROFILE_PLACEMENT_CLASSES[this.placement] || USER_PROFILE_PLACEMENT_CLASSES['bottom-end'],
    ]
      .filter(Boolean)
      .join(' ');
  }

  get visibleItems(): DropdownItem[] {
    return this.items.filter((item) => !item.hidden);
  }

  getItemClass(item: DropdownItem): string {
    if (item.disabled) {
      return `${USER_PROFILE_ITEM_BASE} ${USER_PROFILE_ITEM_DISABLED_CLASS}`;
    }
    const variantStyle = USER_PROFILE_ITEM_VARIANTS[item.variant || 'default'] || USER_PROFILE_ITEM_VARIANTS.default;
    return `${USER_PROFILE_ITEM_BASE} cursor-pointer ${variantStyle}`;
  }

  getItemIconClass(item: DropdownItem): string {
    if (item.disabled) return 'text-gray-400';
    return USER_PROFILE_ITEM_ICON_VARIANTS[item.variant || 'default'] || USER_PROFILE_ITEM_ICON_VARIANTS.default;
  }

  toggle(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
    this.cdr.markForCheck();
  }

  open(): void {
    if (this.isOpen) return;
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
