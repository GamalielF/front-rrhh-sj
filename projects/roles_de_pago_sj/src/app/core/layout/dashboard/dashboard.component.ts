import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LumenDashboardComponent } from '@lumen/base';
import { NavItem, DropdownItem } from '@lumen/ui';
import { AuthService } from '@lumen/auth';
import { PerfilAplicacionService } from '@services';
import type { NombreRol } from '@models';
import { map } from 'rxjs/operators';
import { construirMenu } from './dashboard-menu.util';

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

  private perfilAplicacion = inject(PerfilAplicacionService);
  private roles = toSignal(this.perfilAplicacion.perfil().pipe(map((perfil) => perfil?.roles ?? [])), {
    initialValue: [] as NombreRol[],
  });
  private opcionesMenu = computed(() => construirMenu(this.roles()));

  get navItems(): NavItem[] {
    return this.opcionesMenu();
  }


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
