import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../components/icon/icon.component';
import { NavItem } from './dashboard-layout.model';

@Component({
  selector: 'ui-dashboard-layout',
  standalone: true,
  imports: [CommonModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css'],
})
export class DashboardLayoutComponent {
  @Input() logoSrc = 'img/logo-white.png';
  @Input() logoCompactSrc = 'img/logo-compact-white.png'
  @Input() appTitle = '';
  @Input() showTitle = false;
  @Input() navItems: NavItem[] = [];
  @Input() activeRoute = '';

  @Output() navClick = new EventEmitter<NavItem>();

  readonly sidebarOpen = signal(false);
  readonly sidebarCollapsed = signal(false);

  readonly sidebarWidthPx = computed(() => (this.sidebarCollapsed() ? 86 : 260));

  toggleMobileSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleCollapse(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.sidebarOpen.set(false);
  }

  onNavClick(item: NavItem): void {
    this.navClick.emit(item);
    this.sidebarOpen.set(false);
  }

  isActive(item: NavItem): boolean {
    if (item.active !== undefined) return item.active;
    return !!this.activeRoute && !!item.route && this.activeRoute.startsWith(item.route);
  }
}

