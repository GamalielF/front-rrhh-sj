---
sidebar_position: 3
id: auth-guards
title: Guards de Autenticación
description: Guards para protección de rutas basada en autenticación y roles.
---

# Guards de Autenticación

Los guards protegen las rutas de la aplicación basándose en el estado de autenticación y los roles del usuario.

## authGuard

Guard que protege rutas para usuarios autenticados. Redirige al login si el usuario no está autenticado.

```typescript
export const authGuard: CanActivateFn
```

### Comportamiento

- **Usuario autenticado**: Permite el acceso a la ruta
- **Usuario no autenticado**: Redirige a la URL configurada en `loginRedirectUrl`
- **SSR**: Siempre permite acceso en servidor (para pre-renderizado)

### Configuración

El guard utiliza la configuración de `AUTH_CONFIG` para determinar la URL de redirección:

```typescript
import { provideAuth } from '@lumen/auth';

provideAuth({
  loginRedirectUrl: '/login', // URL por defecto para redirección
})
```

### Ejemplo de Uso

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@lumen/auth';

const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: ProfileComponent
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];
```

## guestGuard

Guard que protege rutas para usuarios NO autenticados (invitados). Redirige al dashboard si el usuario ya está autenticado.

```typescript
export const guestGuard: CanActivateFn
```

### Comportamiento

- **Usuario no autenticado**: Permite el acceso a la ruta
- **Usuario autenticado**: Redirige a la URL configurada en `defaultRedirectUrl`
- **SSR**: Siempre permite acceso en servidor

### Configuración

```typescript
import { provideAuth } from '@lumen/auth';

provideAuth({
  defaultRedirectUrl: '/dashboard', // URL por defecto para usuarios autenticados
})
```

### Ejemplo de Uso

```typescript
import { Routes } from '@angular/router';
import { guestGuard } from '@lumen/auth';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComponent
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    component: RegisterComponent
  },
  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    component: ForgotPasswordComponent
  }
];
```

## roleGuard

Guard que protege rutas basándose en roles específicos del usuario.

```typescript
export const roleGuard: (roles: string[]) => CanActivateFn
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| roles | string[] | Array de roles permitidos para acceder a la ruta |

### Comportamiento

- **Usuario con rol permitido**: Permite el acceso
- **Usuario sin rol permitido**: Redirige a la URL configurada en `forbiddenRedirectUrl`
- **Usuario no autenticado**: Redirige a la URL configurada en `loginRedirectUrl`
- **SSR**: Siempre permite acceso en servidor

### Configuración

```typescript
import { provideAuth } from '@lumen/auth';

provideAuth({
  forbiddenRedirectUrl: '/403', // URL para acceso denegado
  loginRedirectUrl: '/login',
})
```

### Ejemplo de Uso

```typescript
import { Routes } from '@angular/router';
import { roleGuard } from '@lumen/auth';

const routes: Routes = [
  {
    path: 'admin',
    canActivate: [roleGuard(['admin', 'superadmin'])],
    loadChildren: () => import('./admin/admin.module').then(m => m.DashboardModule)
  },
  {
    path: 'manager',
    canActivate: [roleGuard(['manager', 'admin'])],
    component: ManagerDashboardComponent
  },
  {
    path: 'reports',
    canActivate: [roleGuard(['admin', 'manager', 'analyst'])],
    component: ReportsComponent
  }
];
```

### Guard con múltiples roles (uno requerido)

```typescript
// El usuario necesita tener AL MENOS uno de estos roles
{
  path: 'settings',
  canActivate: [roleGuard(['admin', 'moderator'])],
  component: SettingsComponent
}
```

## Combinación de Guards

Puedes combinar múltiples guards para crear lógicas de protección más complejas:

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from '@lumen/auth';

const routes: Routes = [
  // Solo usuarios autenticados
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },

  // Solo usuarios no autenticados
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComp
  },

  // Usuarios autenticados con rol específico
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    component: AdminComponent
  },

  // Usuarios autenticados con múltiples roles posibles
  {
    path: 'management',
    canActivate: [authGuard, roleGuard(['admin', 'manager', 'supervisor'])],
    component: ManagementComponent
  }
];
```

## Guards en Lazy Loading

Los guards funcionan perfectamente con lazy loading de módulos:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  }
];
```

## Manejo de Redirecciones

### Redirección personalizada después de login

Puedes combinar guards con lógica personalizada para redirecciones:

```typescript
import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@lumen/auth';

export const customAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirección después del login
  localStorage.setItem('redirectUrl', state.url);
  return router.parseUrl('/login');
};
```

## Ejemplos Prácticos

### Sistema de permisos completo

```typescript
import { Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from '@lumen/auth';

const routes: Routes = [
  // Públicas
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    component: LoginComponent
  },

  // Autenticadas
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    component: ProfileComponent
  },

  // Por roles
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['admin'])],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: 'management',
    canActivate: [authGuard, roleGuard(['admin', 'manager'])],
    component: ManagementComponent
  },

  // 403 - Acceso denegado
  {
    path: '403',
    component: ForbiddenComponent
  }
];
```

### Guard condicional con datos de ruta

```typescript
const routes: Routes = [
  {
    path: 'documents/:id',
    canActivate: [authGuard, roleGuard(['admin', 'editor'])],
    component: DocumentComponent,
    data: {
      requiredPermission: 'edit'
    }
  }
];
```
