---
sidebar_position: 4
id: base-dashboard
title: LumenDashboardComponent
description: Layout de dashboard con navegación y gestión de usuarios.
---

# LumenDashboardComponent

Layout de dashboard completo con navegación lateral, header de usuario y manejo integrado de autenticación. Proporciona una estructura consistente para aplicaciones administrativas.

## Selector

```html
<lumen-dashboard></lumen-dashboard>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| logoSrc | string | 'img/logo-white.png' | URL del logo para el sidebar |
| logoCompactSrc | string | 'img/logo-compact-white.png' | URL del logo compacto para sidebar colapsado |
| appTitle | string | '' | Título de la aplicación |
| showTitle | boolean | false | Mostrar título junto al logo |
| navItems | NavItem[] | `[{ label: 'Inicio', icon: '@tui.house', route: '/home' }]` | Items de navegación del sidebar |
| userMenuItems | DropdownItem[] | [perfil, divider, logout] | Items del menú de usuario |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| navClick | EventEmitter\<NavItem\> | Emitido cuando se hace click en un item de navegación |
| profileClick | EventEmitter\<void\> | Emitido cuando se hace click en perfil |
| logoutClick | EventEmitter\<void\> | Emitido cuando se hace click en cerrar sesión |

## Propiedades Internas

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| currentUrl | Signal\<string\> | URL actual de la aplicación (reactivo) |
| userProfile | Signal\<UserProfileData\> | Datos del usuario actual (reactivo) |

## Tipos

### NavItem

Item de navegación para el sidebar.

```typescript
interface NavItem {
  label: string;
  icon?: string;
  route?: string;
  onClick?: () => void;
  badge?: string;
  disabled?: boolean;
}
```

### UserProfileData

Datos del perfil de usuario.

```typescript
interface UserProfileData {
  id?: string | number;
  name: string;
  username: string;
  email: string;
  role: string;
  roles?: string[];
  avatarUrl?: string;
}
```

## Ejemplos de Uso

### Uso básico

```typescript
import { LumenDashboardComponent } from '@lumen/base';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard></lumen-dashboard>
  `
})
export class DashboardComponent {}
```

### Personalización de navegación

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [logoSrc]="'/assets/my-logo.png'"
      [appTitle]="'Mi Sistema'"
      [showTitle]="true"
      [navItems]="navigationItems"
      (navClick)="onNavClick($event)">
    </lumen-dashboard>
  `
})
export class CustomDashboardComponent {
  navigationItems: NavItem[] = [
    { label: 'Inicio', icon: '@tui.house', route: '/home' },
    { label: 'Usuarios', icon: '@tui.users', route: '/users' },
    { label: 'Reportes', icon: '@tui.bar-chart', route: '/reports' },
    { label: 'Configuración', icon: '@tui.settings', route: '/settings' },
  ];

  onNavClick(item: NavItem) {
    console.log('Navegando a:', item.label);
  }
}
```

### Configuración completa

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [logoSrc]="'/assets/company-logo.png'"
      [logoCompactSrc]="'/assets/company-logo-compact.png'"
      [appTitle]="'Sistema Administrativo'"
      [showTitle]="true"
      [navItems]="navItems"
      [userMenuItems]="userMenuItems"
      (navClick)="handleNavClick($event)"
      (profileClick)="handleProfileClick()"
      (logoutClick)="handleLogout()">
    </lumen-dashboard>
  `
})
export class FullDashboardComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '@tui.layout-dashboard', route: '/dashboard' },
    { label: 'Usuarios', icon: '@tui.users', route: '/users', badge: 'New' },
    { label: 'Finanzas', icon: '@tui.dollar-sign', route: '/finances' },
    { label: 'Reportes', icon: '@tui.file-text', route: '/reports' },
    { label: 'Configuración', icon: '@tui.settings', route: '/settings' },
  ];

  userMenuItems: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: '@tui.user',
      onClick: () => this.navigateToProfile()
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: '@tui.settings',
      onClick: () => this.navigateToSettings()
    },
    { divider: true },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: '@tui.log-out',
      variant: 'danger',
      onClick: () => this.logout()
    }
  ];

  handleNavClick(item: NavItem) {
    console.log('Navigation:', item);
  }

  handleProfileClick() {
    console.log('Profile clicked');
  }

  handleLogout() {
    console.log('Logout clicked');
  }

  navigateToProfile() {
    // Lógica de navegación
  }

  navigateToSettings() {
    // Lógica de navegación
  }

  logout() {
    // Lógica de logout
  }
}
```

### Navegación dinámica basada en roles

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [navItems]="filteredNavItems"
      [userMenuItems]="filteredUserMenuItems">
    </lumen-dashboard>
  `
})
export class RoleBasedDashboardComponent {
  filteredNavItems: NavItem[] = [];
  filteredUserMenuItems: DropdownItem[] = [];

  allNavItems: NavItem[] = [
    { label: 'Dashboard', icon: '@tui.layout-dashboard', route: '/dashboard', roles: ['all'] },
    { label: 'Usuarios', icon: '@tui.users', route: '/users', roles: ['admin', 'manager'] },
    { label: 'Finanzas', icon: '@tui.dollar-sign', route: '/finances', roles: ['admin', 'finance'] },
    { label: 'Reportes', icon: '@tui.file-text', route: '/reports', roles: ['all'] },
    { label: 'Configuración', icon: '@tui.settings', route: '/settings', roles: ['admin'] },
  ];

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.filterNavigationByRole(user?.roles || []);
    });
  }

  private filterNavigationByRole(userRoles: string[]) {
    this.filteredNavItems = this.allNavItems.filter(item =>
      !item.roles || item.roles.includes('all') || item.roles.some(role => userRoles.includes(role))
    );
  }
}
```

### Integración con routing

```typescript
const routes: Routes = [
  {
    path: '',
    component: LumenDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'reports',
        loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent)
      }
    ]
  }
];
```

### Dashboard con logo personalizado

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [logoSrc]="companyLogo"
      [logoCompactSrc]="companyLogoCompact"
      [appTitle]="companyName"
      [showTitle]="true"
      [navItems]="navigationItems">
    </lumen-dashboard>
  `
})
export class BrandedDashboardComponent {
  companyName = 'Mi Empresa S.A.';
  companyLogo = '/assets/my-company-logo-white.png';
  companyLogoCompact = '/assets/my-company-logo-compact-white.png';

  navigationItems: NavItem[] = [
    { label: 'Inicio', icon: '@tui.house', route: '/home' },
    { label: 'Servicios', icon: '@tuibriefcase', route: '/services' },
    { label: 'Soporte', icon: '@tui.life-buoy', route: '/support' },
  ];
}
```

### Menú de usuario personalizado

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [userMenuItems]="customUserMenu"
      (profileClick)="onProfileClick()"
      (logoutClick)="onLogout()">
    </lumen-dashboard>
  `
})
export class CustomUserMenuDashboardComponent {
  customUserMenu: DropdownItem[] = [
    {
      id: 'profile',
      label: 'Mi Perfil',
      icon: '@tui.user',
      description: 'Ver y editar perfil',
      onClick: () => this.goToProfile()
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: '@tui.bell',
      badge: '3',
      onClick: () => this.goToNotifications()
    },
    {
      id: 'help',
      label: 'Ayuda',
      icon: '@tui.help-circle',
      onClick: () => this.goToHelp()
    },
    { divider: true },
    {
      id: 'theme',
      label: 'Cambiar Tema',
      icon: '@tui.moon',
      onClick: () => this.toggleTheme()
    },
    { divider: true },
    {
      id: 'logout',
      label: 'Cerrar Sesión',
      icon: '@tui.log-out',
      variant: 'danger',
      onClick: () => this.logout()
    }
  ];

  goToProfile() { /* ... */ }
  goToNotifications() { /* ... */ }
  goToHelp() { /* ... */ }
  toggleTheme() { /* ... */ }
  logout() { /* ... */ }
  onProfileClick() { /* ... */ }
  onLogout() { /* ... */ }
}
```

### Navegación con badges y estados

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LumenDashboardComponent],
  template: `
    <lumen-dashboard
      [navItems]="navItemsWithBadges">
    </lumen-dashboard>
  `
})
export class BadgedNavDashboardComponent {
  navItemsWithBadges: NavItem[] = [
    {
      label: 'Dashboard',
      icon: '@tui.layout-dashboard',
      route: '/dashboard'
    },
    {
      label: 'Mensajes',
      icon: '@tui.message-square',
      route: '/messages',
      badge: '5'
    },
    {
      label: 'Tareas',
      icon: '@tui.check-square',
      route: '/tasks',
      badge: '12'
    },
    {
      label: 'Alertas',
      icon: '@tui.alert-triangle',
      route: '/alerts',
      badge: '!',
      disabled: true
    },
  ];
}
```

## Dependencias

El componente utiliza:

- **@lumen/auth**: `AuthService` para gestión de usuario
- **@lumen/ui**: `DashboardLayoutComponent`, `UserProfileMenuComponent`
- **@angular/router**: `Router` para navegación
- **@angular/core**: Signals para reactividad

## Configuración Requerida

El componente requiere que `@lumen/auth` esté configurado:

```typescript
import { provideAuth } from '@lumen/auth';

@NgModule({
  providers: [
    provideAuth({
      loginUrl: '/api/auth/login',
      defaultRedirectUrl: '/home',
      loginRedirectUrl: '/login',
    }),
  ],
})
export class AppModule {}
```

## Comportamiento de Navegación

1. **Click en nav item**: Emite evento `navClick` y navega a la ruta si está definida
2. **Click en perfil**: Emite evento `profileClick` y navega a `/home`
3. **Click en logout**: Emite evento `logoutClick`, cierra sesión y navega a `/login`

## Perfil de Usuario

El componente obtiene automáticamente los datos del usuario desde `AuthService.user$`:

- Si no hay usuario, usa valores por defecto
- Mapea campos de `UserSession` a `UserProfileData`
- Soporta avatar desde `avatarUrl` o `avatar`

## Responsive Design

El layout es responsive y se adapta a diferentes tamaños de pantalla:

- **Desktop**: Sidebar expandido con logo completo
- **Tablet**: Sidebar colapsado con logo compacto
- **Mobile**: Menú hamburguesa (depende de implementación de `DashboardLayoutComponent`)

## Casos de Uso Recomendados

1. **Panel administrativo**: Sistema de gestión backend
2. **Dashboard financiero**: Sistema de gestión financiera
3. **CRM**: Sistema de gestión de relaciones con clientes
4. **ERP**: Sistema de planificación de recursos
5. **Portal interno**: Intranet corporativa

## Consideraciones

- El componente maneja automáticamente el logout
- Los datos del usuario se obtienen reactivamente desde `AuthService`
- Para personalización avanzada, considera extender el componente
- La navegación por defecto incluye home, perfil y logout
