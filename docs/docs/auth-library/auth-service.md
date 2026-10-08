---
sidebar_position: 2
id: auth-service
title: AuthService
description: Servicio principal de autenticación con gestión de sesiones y tokens.
---

# AuthService

El `AuthService` es el servicio principal de la librería que gestiona toda la lógica de autenticación, incluyendo login, logout, gestión de tokens y sesión de usuario.

## Métodos del Servicio

### login()

Inicia sesión con las credenciales proporcionadas.

```typescript
login(username: string, password: string, customUrl?: string): Observable<LoginResponse>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| username | string | Sí | Nombre de usuario o email |
| password | string | Sí | Contraseña del usuario |
| customUrl | string | No | URL personalizada para el login (sobrescribe la configuración) |

**Retorna**: `Observable<LoginResponse>` - Respuesta del servidor con token y datos de usuario

### setSession()

Establece la sesión de usuario con token y datos opcionales.

```typescript
setSession(token: string, user?: UserSession, refreshToken?: string): void
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| token | string | Sí | Token de acceso JWT |
| user | UserSession | No | Datos del usuario |
| refreshToken | string | No | Token de refresh para renovación automática |

### logout()

Cierra la sesión del usuario y limpia todos los tokens.

```typescript
logout(): void
```

### getToken()

Obtiene el token de acceso actual del almacenamiento.

```typescript
getToken(): string | null
```

**Retorna**: Token de acceso o `null` si no existe

### getUser()

Obtiene los datos del usuario actual del almacenamiento.

```typescript
getUser(): UserSession | null
```

**Retorna**: Datos del usuario o `null` si no hay sesión

### getRefreshToken()

Obtiene el token de refresh actual.

```typescript
getRefreshToken(): string | null
```

**Retorna**: Token de refresh o `null` si no existe

### refreshAccessToken()

Renueva el token de acceso usando el token de refresh.

```typescript
refreshAccessToken(): Observable<LoginResponse>
```

**Retorna**: `Observable<LoginResponse>` - Nueva respuesta con token actualizado

### isAuthenticated()

Verifica si hay un usuario autenticado.

```typescript
isAuthenticated(): boolean
```

**Retorna**: `true` si hay token, `false` en caso contrario

### hasRole()

Verifica si el usuario actual tiene un rol específico.

```typescript
hasRole(role: string): boolean
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| role | string | Sí | Nombre del rol a verificar |

**Retorna**: `true` si el usuario tiene el rol, `false` en caso contrario

### hasAnyRole()

Verifica si el usuario actual tiene alguno de los roles especificados.

```typescript
hasAnyRole(roles: string[]): boolean
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| roles | string[] | Sí | Array de roles a verificar |

**Retorna**: `true` si el usuario tiene al menos uno de los roles

## Propiedades Observables

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| token$ | Observable\<string \| null\> | Emite cambios en el token de acceso |
| user$ | Observable\<UserSession \| null\> | Emite cambios en los datos del usuario |
| isAuthenticated$ | Observable\<boolean\> | Emite estado de autenticación |

## Ejemplos de Uso

### Login básico

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class LoginComponent {
  private authService = inject(AuthService);

  onLogin(username: string, password: string) {
    this.authService.login(username, password).subscribe({
      next: (response) => {
        console.log('Login exitoso', response);
        // Redirección automática o manejo de éxito
      },
      error: (error) => {
        console.error('Error en login', error);
        // Manejo de errores
      }
    });
  }
}
```

### Verificar estado de autenticación

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class HeaderComponent {
  private authService = inject(AuthService);

  isAuthenticated$ = this.authService.isAuthenticated$;
  user$ = this.authService.user$;
}
```

### Logout

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class HeaderComponent {
  private authService = inject(AuthService);

  onLogout() {
    this.authService.logout();
    // Redirección a login o página principal
  }
}
```

### Verificación de roles

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class AdminPanelComponent {
  private authService = inject(AuthService);

  canAccessAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  canAccessAnyManagerRole(): boolean {
    return this.authService.hasAnyRole(['admin', 'manager', 'supervisor']);
  }
}
```

### Observar cambios de usuario

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class UserProfileComponent {
  private authService = inject(AuthService);

  constructor() {
    this.authService.user$.subscribe(user => {
      if (user) {
        console.log('Usuario actual:', user);
        // Actualizar UI con datos del usuario
      }
    });
  }
}
```

### Login con URL personalizada

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class LoginComponent {
  private authService = inject(AuthService);

  onLoginWithCustomEndpoint(username: string, password: string) {
    const customUrl = 'https://api.external.com/auth/login';
    this.authService.login(username, password, customUrl).subscribe({
      next: (response) => {
        console.log('Login con endpoint personalizado', response);
      }
    });
  }
}
```

### Establecer sesión manualmente

```typescript
import { AuthService } from '@lumen/auth';

@Component({
  // ...
})
export class AuthCallbackComponent {
  private authService = inject(AuthService);

  handleOAuthCallback(token: string, userData: any) {
    this.authService.setSession(
      token,
      {
        id: userData.id,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        roles: userData.roles
      },
      userData.refreshToken
    );
  }
}
```
