---
sidebar_position: 4
id: auth-interceptors
title: Interceptores HTTP
description: Interceptores para inyección de tokens y refresh automático.
---

# Interceptores HTTP

Los interceptores HTTP de la librería `@lumen/auth` manejan automáticamente la inyección de tokens en las peticiones HTTP y el refresh de tokens cuando expiran.

## authInterceptor

El interceptor principal que añade el token de acceso a las peticiones HTTP y maneja el refresh automático cuando el token expira.

```typescript
export const authInterceptor: HttpInterceptorFn
```

### Funcionalidades

1. **Inyección de tokens**: Añade automáticamente el header `Authorization` con el token Bearer
2. **Refresh automático**: Cuando recibe un 401, intenta renovar el token si está habilitado
3. **Logout automático**: Si el refresh falla o no está habilitado, cierra la sesión
4. **Redirección**: Redirige al login cuando la sesión expira

### Configuración

El interceptor utiliza la configuración de `AUTH_CONFIG`:

```typescript
import { provideAuth } from '@lumen/auth';

provideAuth({
  loginRedirectUrl: '/login',
  refreshUrl: '/api/auth/refresh',
  enableRefreshToken: true,
})
```

### Opciones de Configuración

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| loginRedirectUrl | string | '/login' | URL para redirección cuando expira la sesión |
| refreshUrl | string | '/api/auth/refresh' | Endpoint para refresh de tokens |
| enableRefreshToken | boolean | true | Habilita/deshabilita el refresh automático |

### Registro del Interceptor

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@lumen/auth';

@NgModule({
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAuth({
      loginRedirectUrl: '/login',
      refreshUrl: '/api/auth/refresh',
      enableRefreshToken: true,
    }),
  ],
})
export class AppModule {}
```

### Registro en Angular Standalone

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor, provideAuth } from '@lumen/auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAuth({
      loginRedirectUrl: '/login',
      refreshUrl: '/api/auth/refresh',
      enableRefreshToken: true,
    }),
  ],
});
```

## Comportamiento del Interceptor

### Flujo Normal (Token Válido)

1. El interceptor detecta una petición HTTP saliente
2. Obtiene el token actual del `AuthService`
3. Si existe un token, añade el header `Authorization: Bearer <token>`
4. La petición continúa normalmente

### Flujo con Token Expirado (401)

1. La petición recibe un error 401 del servidor
2. Si `enableRefreshToken` es `true` y existe refresh token:
   - Llama al endpoint de refresh
   - Si tiene éxito, actualiza el token y reintenta la petición original
   - Si falla, cierra la sesión y redirige al login
3. Si `enableRefreshToken` es `false` o no hay refresh token:
   - Cierra la sesión
   - Redirige al login

## Ejemplos de Uso

### Configuración básica

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor, provideAuth } from '@lumen/auth';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideAuth({
      loginRedirectUrl: '/login',
      refreshUrl: '/api/auth/refresh',
      enableRefreshToken: true,
    }),
  ],
});
```

### Deshabilitar refresh automático

```typescript
provideAuth({
  loginRedirectUrl: '/login',
  refreshUrl: '/api/auth/refresh',
  enableRefreshToken: false, // Solo logout, sin refresh
})
```

### Configuración con endpoints personalizados

```typescript
provideAuth({
  loginRedirectUrl: '/auth/login',
  refreshUrl: 'https://api.external.com/v1/auth/refresh',
  enableRefreshToken: true,
})
```

## Peticiones con Token

Todas las peticiones HTTP realizadas con `HttpClient` incluirán automáticamente el token:

```typescript
import { HttpClient } from '@angular/common/http';

@Component({
  // ...
})
export class DataService {
  private http = inject(HttpClient);

  // Esta petición incluirá automáticamente el header Authorization
  getUsers() {
    return this.http.get('/api/users');
  }

  // También funciona con POST, PUT, DELETE, etc.
  createUser(userData: any) {
    return this.http.post('/api/users', userData);
  }
}
```

## Peticiones sin Token (Opcional)

Si necesitas excluir ciertas peticiones del interceptor, puedes usar `HttpContext`:

```typescript
import { HttpClient, HttpContext } from '@angular/common/http';

// Define un token para excluir peticiones
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);

@Component({
  // ...
})
export class PublicDataService {
  private http = inject(HttpClient);

  // Petición pública sin token
  getPublicData() {
    const context = new HttpContext().set(SKIP_AUTH, true);
    return this.http.get('/api/public/data', { context });
  }
}
```

## Manejo de Errores

El interceptor maneja automáticamente los errores 401, pero puedes manejar otros errores en tus servicios:

```typescript
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  // ...
})
export class DataService {
  private http = inject(HttpClient);

  getData() {
    return this.http.get('/api/data').pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403) {
          console.error('Acceso denegado');
        } else if (error.status === 500) {
          console.error('Error del servidor');
        }
        return throwError(() => error);
      })
    );
  }
}
```

## Combinación con Otros Interceptores

Puedes combinar el `authInterceptor` con otros interceptores:

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@lumen/auth';
import { loggingInterceptor } from './interceptors/logging.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(
      withInterceptors([
        loggingInterceptor,  // Se ejecuta primero
        authInterceptor,     // Se ejecuta después
      ])
    ),
    provideAuth({
      loginRedirectUrl: '/login',
      refreshUrl: '/api/auth/refresh',
      enableRefreshToken: true,
    }),
  ],
});
```

## Debug del Interceptor

Para debuggear el comportamiento del interceptor, puedes añadir logs temporales:

```typescript
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const debugAuthInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Petición:', req.url);
  console.log('Headers:', req.headers);

  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`
    }
  });

  console.log('Petición con auth:', authReq.headers);

  return next(authReq);
};
```

## Consideraciones de Seguridad

1. **HTTPS**: Siempre usa HTTPS en producción para proteger los tokens
2. **Storage**: Los tokens se almacenan en localStorage (configuración actual)
3. **XSS**: Considera implementar protecciones contra XSS
4. **CSRF**: Considera implementar protección CSRF para peticiones state-changing
5. **Token Expiration**: Implementa verificación de expiración del token del lado del cliente

## Solución de Problemas

### El token no se está enviando

- Verifica que el usuario esté autenticado
- Revisa que el interceptor esté registrado correctamente
- Verifica la configuración de `tokenName`

### El refresh no funciona

- Verifica que `enableRefreshToken` sea `true`
- Revisa que el endpoint de refresh sea correcto
- Verifica que el refresh token exista en localStorage

### Redirecciones infinitas al login

- Verifica la configuración de `loginRedirectUrl`
- Revisa que no haya guards conflictivos
- Verifica que el token se esté guardando correctamente

### Peticiones fallan después del refresh

- Verifica que el endpoint de refresh retorne el formato correcto
- Revisa que el nuevo token se esté guardando correctamente
- Verifica que la petición original se esté reintentando
