import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LumenDashboardComponent } from '@lumen/base';
import { NavItem, DropdownItem } from '@lumen/ui';
import { AuthService } from '@lumen/auth';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [CommonModule, LumenDashboardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardShellComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly navItems: NavItem[] = [
    { label: 'Inicio', icon: '@tui.house', route: '/home' },
    { label: 'Mi rol de pago', icon: '@tui.file-text', route: '/mi-rol' },
    { label: 'Test', icon: '@tui.settings', route: '/test' },
  ];

  readonly userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: '@tui.user',
      onClick: () => this.router.navigate(['/home']),
    },
    {
      divider: true,
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: '@tui.log-out',
      variant: 'danger',
      onClick: () => {
        this.authService.logout();
        this.router.navigate(['/login']);
      },
    },
  ];
}
