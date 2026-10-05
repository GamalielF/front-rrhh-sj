import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import {
  DashboardLayoutComponent,
  NavItem,
  UserProfileMenuComponent,
  UserProfileData,
  DropdownItem,
} from '@lumen/ui';
import { AuthService } from '@lumen/auth';

@Component({
  selector: 'lumen-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    DashboardLayoutComponent,
    UserProfileMenuComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class LumenDashboardComponent {
  protected router = inject(Router);
  protected authService = inject(AuthService);

  @Input() logoSrc = 'img/logo-white.png';
  @Input() logoCompactSrc = 'img/logo-compact-white.png';
  @Input() appTitle = '';
  @Input() showTitle = false;

  @Input() navItems: NavItem[] = [
    { label: 'Inicio', icon: '@tui.house', route: '/home' },
  ];

  @Input() userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: '@tui.user',
      onClick: () => this.onProfileClick(),
    },
    {
      divider: true,
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: '@tui.log-out',
      variant: 'danger',
      onClick: () => this.logout(),
    },
  ];

  @Output() navClick = new EventEmitter<NavItem>();
  @Output() profileClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(e => e.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly userProfile = toSignal(
    this.authService.user$.pipe(
      map((u): UserProfileData => {
        if (!u) {
          return {
            name: 'DEFAULT_NAME',
            username: 'DEFAULT_USERNAME',
            email: 'DEFAULT_EMAIL',
            role: 'DEFAULT_ROLE',
          };
        }
        return {
          id: u.id,
          name: u.name || u.username || 'DEFAULT_NAME',
          username: u.username || 'DEFAULT_USERNAME',
          email: u.email || `${u.username || 'DEFAULT_USERNAME'}@coopsanjose.com`,
          role: (u.roles && u.roles.length > 0) ? u.roles[0] : 'DEFAULT_ROLE',
          roles: u.roles || ['DEFAULT_ROLE'],
          avatarUrl: (u['avatarUrl'] as string) || (u['avatar'] as string) || undefined,
        };
      })
    ),
    {
      initialValue: {
        name: 'DEFAULT_NAME',
        username: 'DEFAULT_USERNAME',
        email: 'DEFAULT_EMAIL',
        role: 'DEFAULT_ROLE',
      },
    }
  );

  onNavClick(item: NavItem): void {
    this.navClick.emit(item);
    if (item.route) {
      this.router.navigate([item.route]);
    }
  }

  onProfileClick(): void {
    this.profileClick.emit();
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.logoutClick.emit();
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
