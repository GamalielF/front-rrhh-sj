import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';
import {UserProfileData } from '../user-profile-menu/user-profile-menu.model';

@Component({
  selector: 'ui-avatar-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './avatar-icon.component.html',
})
export class AvatarIconComponent {

  @Input() user: UserProfileData | null = null;
  @Input() fullName: string | null = null;
  @Input() iconUrl: string | null | undefined = null;
  @Input() bgColor = 'bg-[#0061A1]';

  get displayName(): string {
    if (!this.user && !this.fullName) return 'Usuario';
    return this.user?.name || this.user?.username || this.fullName || 'Usuario';
  }

  get initials(): string {
    const name = this.displayName.trim();
    if (!name) return 'U';
    const parts = name.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[2][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
