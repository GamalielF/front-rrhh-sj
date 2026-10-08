---
sidebar_position: 5
id: auth-models
title: Modelos y Tokens
description: Modelos TypeScript y tokens de inyección de dependencias.
---

# Modelos y Tokens

Documentación de los modelos TypeScript y tokens de inyección de dependencias utilizados en la librería `@lumen/auth`.

## Modelos TypeScript

### LoginCredentials

Credenciales para el inicio de sesión.

```typescript
export interface LoginCredentials {
  username?: string;
  password?: string;
}
```

| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| username | string | No | Nombre de usuario o email |
| password | string | No | Contraseña del usuario |

### UserSession

Datos de la sesión de usuario autenticado.

```typescript
export interface UserSession {
  id?: string | number;
  username: string;
  name?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}
```

| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| id | string \| number | No | Identificador único del usuario |
| username | string | Sí | Nombre de usuario (usado para default) |
| name | string | No | Nombre completo del usuario |
| email | string | No | Email del usuario |
| roles | string[] | No | Array de roles asignados al usuario |
| [key: string] | unknown | No | Propiedades adicionales (extensible) |

### LoginResponse

Respuesta del servidor después de un login exitoso o refresh de token.

```typescript
export interface LoginResponse {
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  user?: UserSession;
  message?: string;
  [key: string]: unknown;
}
```

| Propiedad | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| accessToken | string | No | Token de acceso JWT (prioridad) |
| token | string | No | Token de acceso (alternativo) |
| refreshToken | string | No | Token para refresh automático |
| user | UserSession | No | Datos del usuario autenticado |
| message | string | No | Mensaje del servidor |
| [key: string] | unknown | No | Propiedades adicionales (extensible) |

**Nota**: El servicio usa `accessToken` o `token` (en ese orden de prioridad) para obtener el token de acceso.

### AuthConfig

Configuración del sistema de autenticación.

```typescript
export interface AuthConfig {
  loginUrl?: string;
  tokenName?: string;
  defaultRedirectUrl?: string;
  loginRedirectUrl?: string;
  refreshUrl?: string;
  enableRefreshToken?: boolean;
  forbiddenRedirectUrl?: string;
}
```

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| loginUrl | string | '/api/auth/login' | URL del endpoint de login |
| tokenName | string | 'access_token' | Nombre usado para almacenar el token |
| defaultRedirectUrl | string | '/dashboard' | URL de redirección por defecto después del login |
| loginRedirectUrl | string | '/login' | URL para redirección cuando no está autenticado |
| refreshUrl | string | '/api/auth/refresh' | URL del endpoint de refresh de token |
| enableRefreshToken | boolean | true | Habilita refresh automático de token |
| forbiddenRedirectUrl | string | '/403' | URL para acceso denegado (403) |

## Tokens de Inyección

### AUTH_CONFIG

Token de inyección para proporcionar configuración personalizada de autenticación.

```typescript
export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
```

### DEFAULT_AUTH_CONFIG

Configuración por defecto utilizada cuando no se proporciona configuración personalizada.

```typescript
export const DEFAULT_AUTH_CONFIG: AuthConfig = {
  loginUrl: '/api/auth/login',
  tokenName: 'access_token',
  defaultRedirectUrl: '/dashboard',
  loginRedirectUrl: '/login',
  refreshUrl: '/api/auth/refresh',
  enableRefreshToken: true,
  forbiddenRedirectUrl: '/403',
};
```

## Funciones de Proveedor

### provideAuth()

Función helper para proporcionar la configuración de autenticación de manera type-safe.

```typescript
export function provideAuth(config?: Partial<AuthConfig>): Provider[]
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| config | Partial\<AuthConfig\> | No | Configuración personalizada (merge con defaults) |

**Retorna**: Array de providers para Angular

## Ejemplos de Uso

### Configuración personalizada completa

```typescript
import { provideAuth } from '@lumen/auth';

@NgModule({
  providers: [
    provideAuth({
      loginUrl: 'https://api.example.com/v1/auth/login',
      tokenName: 'jwt_token',
      defaultRedirectUrl: '/home',
      loginRedirectUrl: '/sign-in',
      refreshUrl: 'https://api.example.com/v1/auth/refresh',
      enableRefreshToken: true,
      forbiddenRedirectUrl: '/access-denied',
    }),
  ],
})
export class AppModule {}
```

### Configuración parcial (usando defaults)

```typescript
import { provideAuth } from '@lumen/auth';

@NgModule({
  providers: [
    provideAuth({
      loginUrl: '/api/custom-login',
      tokenName: 'custom_token',
    }),
  ],
})
export class AppModule {}
```

### Uso de modelos en componentes

```typescript
import { UserSession, LoginCredentials } from '@lumen/auth';

@Component({
  // ...
})
export class LoginComponent {
  credentials: LoginCredentials = {
    username: '',
    password: ''
  };

  onLogin() {
    // credentials es del tipo LoginCredentials
    console.log(this.credentials);
  }
}

@Component({
  // ...
})
export class UserProfileComponent {
  currentUser: UserSession | null = null;

  constructor(private authService: AuthService) {
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
      // user es del tipo UserSession
      if (user) {
        console.log('User ID:', user.id);
        console.log('Username:', user.username);
        console.log('Roles:', user.roles);
      }
    });
  }
}
```

### Tipado de respuestas de API

```typescript
import { LoginResponse } from '@lumen/auth';

@Component({
  // ...
})
export class LoginComponent {
  onLogin() {
    this.authService.login('user', 'pass').subscribe({
      next: (response: LoginResponse) => {
        // response está tipado como LoginResponse
        if (response.accessToken) {
          console.log('Token recibido:', response.accessToken);
        }
        if (response.user) {
          console.log('Usuario:', response.user);
        }
      }
    });
  }
}
```

### Extensión de modelos

Los modelos son extensibles gracias al index signature:

```typescript
// Extender UserSession con propiedades personalizadas
const customUser: UserSession = {
  id: '123',
  username: 'john',
  name: 'John Doe',
  email: 'john@example.com',
  roles: ['admin'],
  // Propiedades personalizadas
  department: 'Engineering',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'dark',
    language: 'es'
  }
};

// Extender LoginResponse con campos adicionales
const customResponse: LoginResponse = {
  accessToken: 'jwt_token_here',
  user: customUser,
  // Campos adicionales del servidor
  expiresIn: 3600,
  tokenType: 'Bearer'
};
```

### Configuración basada en ambiente

```typescript
import { provideAuth } from '@lumen/auth';
import { environment } from '../environments/environment';

@NgModule({
  providers: [
    provideAuth({
      loginUrl: environment.production
        ? 'https://api.production.com/auth/login'
        : 'http://localhost:3000/auth/login',
      refreshUrl: environment.production
        ? 'https://api.production.com/auth/refresh'
        : 'http://localhost:3000/auth/refresh',
      enableRefreshToken: !environment.disableRefresh,
    }),
  ],
})
export class AppModule {}
```

### Validación de modelos

```typescript
import { UserSession, LoginCredentials } from '@lumen/auth';

function validateUserSession(user: any): user is UserSession {
  return (
    user &&
    typeof user.username === 'string' &&
    Array.isArray(user.roles) || user.roles === undefined
  );
}

function validateLoginCredentials(credentials: any): credentials is LoginCredentials {
  return (
    credentials &&
    typeof credentials.username === 'string' &&
    typeof credentials.password === 'string'
  );
}
```

## Consideraciones de Diseño

### Index Signatures

Los modelos incluyen `[key: string]: unknown` para permitir extensibilidad:

- **Ventaja**: Permite agregar propiedades personalizadas sin modificar los tipos base
- **Desventaja**: Pierde type-safety estricto para propiedades adicionales
- **Recomendación**: Para propiedades conocidas, considera extender las interfaces

### Nombres de Propiedades

- `accessToken` vs `token`: El servicio soporta ambos nombres para compatibilidad
- `tokenName`: Configurable para diferentes convenciones de almacenamiento
- Roles como `string[]`: Permite sistemas de roles flexibles

### Valores Opcionales

La mayoría de las propiedades son opcionales para:
- Compatibilidad con diferentes APIs de backend
- Flexibilidad en implementaciones personalizadas
- Soporte para migraciones graduales
