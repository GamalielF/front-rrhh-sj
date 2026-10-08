---
sidebar_position: 3
id: http-models
title: Modelos y Tokens
description: Modelos TypeScript y tokens de inyección para configuración HTTP.
---

# Modelos y Tokens

Documentación de los modelos TypeScript y tokens de inyección de dependencias utilizados en la librería `@lumen/http`.

## Modelos TypeScript

### HttpOptions

Opciones adicionales para las peticiones HTTP.

```typescript
export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: QueryParamsType;
  context?: HttpContext;
  responseType?: 'json';
  withCredentials?: boolean;
}
```

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| headers | HttpHeaders \| Record | undefined | Headers HTTP adicionales |
| params | QueryParamsType | undefined | Parámetros de consulta (query params) |
| context | HttpContext | undefined | Contexto HTTP para metadatos |
| responseType | 'json' | 'json' | Tipo de respuesta (solo json soportado) |
| withCredentials | boolean | undefined | Incluir cookies en peticiones cross-origin |

### QueryParamsType

Tipo unión para diferentes formatos de parámetros de consulta.

```typescript
export type QueryParamsType =
  | HttpParams
  | Record<string, string | number | boolean | readonly (string | number | boolean)[] | null | undefined>;
```

**Formatos soportados**:
- `HttpParams`: Objeto HttpParams de Angular
- `Record`: Objeto simple con valores primitivos o arrays

### HttpConfig

Configuración global del servicio HTTP.

```typescript
export interface HttpConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}
```

| Propiedad | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| baseUrl | string | '' | URL base para todas las peticiones relativas |
| defaultHeaders | `Record<string, string>` | `{ 'Content-Type': 'application/json', 'Accept': 'application/json' }` | Headers por defecto para todas las peticiones |

### ApiError

Estructura estándar para errores de API.

```typescript
export interface ApiError {
  status: number;
  message: string;
  error?: unknown;
}
```

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| status | number | Código de estado HTTP |
| message | string | Mensaje de error |
| error | unknown | Detalles adicionales del error |

## Tokens de Inyección

### HTTP_CONFIG

Token de inyección para proporcionar configuración personalizada HTTP.

```typescript
export const HTTP_CONFIG = new InjectionToken<HttpConfig>('HTTP_CONFIG');
```

### DEFAULT_HTTP_CONFIG

Configuración por defecto utilizada cuando no se proporciona configuración personalizada.

```typescript
export const DEFAULT_HTTP_CONFIG: HttpConfig = {
  baseUrl: '',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};
```

## Funciones de Proveedor

### provideHttp()

Función helper para proporcionar la configuración HTTP de manera type-safe.

```typescript
export function provideHttp(config?: Partial<HttpConfig>): Provider[]
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| config | `Partial<HttpConfig>` | No | Configuración personalizada (merge con defaults) |

**Retorna**: Array de providers para Angular

## Ejemplos de Uso

### Configuración personalizada completa

```typescript
import { provideHttp } from '@lumen/http';

@NgModule({
  providers: [
    provideHttp({
      baseUrl: 'https://api.example.com/v1',
      defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Version': 'v1',
        'X-Client-ID': 'my-app',
      },
    }),
  ],
})
export class AppModule {}
```

### Configuración mínima

```typescript
import { provideHttp } from '@lumen/http';

@NgModule({
  providers: [
    provideHttp({
      baseUrl: 'https://api.example.com/api',
    }),
  ],
})
export class AppModule {}
```

### Solo headers personalizados

```typescript
import { provideHttp } from '@lumen/http';

@NgModule({
  providers: [
    provideHttp({
      defaultHeaders: {
        'Content-Type': 'application/vnd.api+json',
        'Accept': 'application/vnd.api+json',
      },
    }),
  ],
})
export class AppModule {}
```

### Uso de HttpOptions

```typescript
import { HttpOptions } from '@lumen/http';

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithOptions() {
    const options: HttpOptions = {
      headers: {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer token'
      },
      params: {
        page: 1,
        limit: 10,
        active: true
      },
      withCredentials: true
    };

    return this.apiService.get<any>('/data', options);
  }
}
```

### QueryParams con diferentes tipos

```typescript
@Component({
  // ...
})
export class SearchComponent {
  private apiService = inject(ApiService);

  searchWithVariousParams() {
    return this.apiService.get<any>('/search', {
      params: {
        // String
        query: 'search term',
        // Number
        page: 1,
        limit: 20,
        // Boolean
        active: true,
        verified: false,
        // Array
        tags: ['tag1', 'tag2', 'tag3'],
        categories: ['tech', 'news'],
        // Null/undefined (serán ignorados)
        filter: null,
        optional: undefined
      }
    });
  }
}
```

### Uso de HttpParams de Angular

```typescript
import { HttpParams } from '@angular/common/http';

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithHttpParams() {
    let params = new HttpParams()
      .set('page', '1')
      .set('limit', '10')
      .set('sort', 'name');

    return this.apiService.get<any>('/data', { params });
  }
}
```

### Manejo de errores tipado

```typescript
import { ApiError } from '@lumen/http';

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getData() {
    return this.apiService.get<any>('/data').pipe(
      catchError((error: HttpErrorResponse) => {
        const apiError: ApiError = {
          status: error.status,
          message: error.message,
          error: error.error
        };

        console.error('API Error:', apiError);

        if (apiError.status === 404) {
          // Manejo específico para 404
        } else if (apiError.status === 500) {
          // Manejo específico para 500
        }

        return throwError(() => apiError);
      })
    );
  }
}
```

### Configuración basada en ambiente

```typescript
import { provideHttp } from '@lumen/http';
import { environment } from '../environments/environment';

@NgModule({
  providers: [
    provideHttp({
      baseUrl: environment.apiUrl,
      defaultHeaders: environment.production
        ? {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Production': 'true'
          }
        : {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Development': 'true'
          }
    }),
  ],
})
export class AppModule {}
```

### Extensión de modelos

```typescript
// Extender HttpOptions con propiedades personalizadas
interface CustomHttpOptions extends HttpOptions {
  cache?: boolean;
  retry?: number;
  timeout?: number;
}

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithCustomOptions() {
    const options: CustomHttpOptions = {
      headers: {
        'X-Custom': 'value'
      },
      params: {
        page: 1
      },
      cache: true,
      retry: 3,
      timeout: 5000
    };

    // Nota: Las propiedades personalizadas no son usadas por ApiService
    // pero pueden ser útiles para lógica personalizada
    return this.apiService.get<any>('/data', {
      headers: options.headers,
      params: options.params
    });
  }
}
```

### Headers complejos

```typescript
@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithComplexHeaders() {
    return this.apiService.get<any>('/data', {
      headers: {
        // Header simple
        'X-Simple': 'value',
        // Header con array
        'X-Multiple': ['value1', 'value2'],
        // Headers de autenticación
        'Authorization': 'Bearer token123',
        'X-API-Key': 'api-key-123',
        // Headers de contenido
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'es-ES,es;q=0.9',
        // Headers personalizados
        'X-Request-ID': 'uuid-123',
        'X-Client-Version': '1.0.0'
      }
    });
  }
}
```

### Uso de HttpContext

```typescript
import { HttpContext, HttpContextToken } from '@angular/common/http';

// Crear token personalizado
const CACHE_ENABLED = new HttpContextToken<boolean>(() => false);

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithContext() {
    const context = new HttpContext();
    context.set(CACHE_ENABLED, true);

    return this.apiService.get<any>('/data', { context });
  }
}
```

### Configuración múltiple para diferentes APIs

```typescript
import { InjectionToken } from '@angular/core';

// Configuración para API principal
const MAIN_API_CONFIG = new InjectionToken<HttpConfig>('MAIN_API_CONFIG');

// Configuración para API externa
const EXTERNAL_API_CONFIG = new InjectionToken<HttpConfig>('EXTERNAL_API_CONFIG');

@NgModule({
  providers: [
    provideHttp({
      baseUrl: 'https://api.main.com/v1',
    }),
    {
      provide: MAIN_API_CONFIG,
      useValue: {
        baseUrl: 'https://api.main.com/v1',
        defaultHeaders: {
          'X-API-Type': 'main'
        }
      }
    },
    {
      provide: EXTERNAL_API_CONFIG,
      useValue: {
        baseUrl: 'https://api.external.com/v1',
        defaultHeaders: {
          'X-API-Type': 'external'
        }
      }
    }
  ],
})
export class AppModule {}
```

## Consideraciones de Diseño

### URL Resolution

El servicio maneja automáticamente la resolución de URLs:

- **URLs absolutas** (`http://`, `https://`): Se usan tal cual
- **URLs relativas**: Se combinan con la `baseUrl` configurada
- **Sin base URL**: Se usa el endpoint relativo con `/` inicial

### Query Parameters

El servicio convierte automáticamente diferentes tipos de parámetros:

- **Primitivos**: `string`, `number`, `boolean` → `key=value`
- **Arrays**: `['a', 'b']` → `key=a&key=b`
- **Null/Undefined**: Son ignorados automáticamente

### Headers

Los headers pueden ser:
- **Objeto simple**: `Record<string, string | string[]>`
- **HttpParams**: Objeto HttpParams de Angular
- **HttpHeaders**: Objeto HttpHeaders de Angular

### Response Type

Actualmente solo se soporta `'json'` como response type para mantener simplicidad y consistencia.

### With Credentials

La opción `withCredentials` controla si se deben incluir cookies en peticiones cross-origin (CORS).
