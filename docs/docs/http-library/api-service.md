---
sidebar_position: 2
id: http-api-service
title: ApiService
description: Servicio principal para peticiones HTTP con configuración centralizada.
---

# ApiService

El `ApiService` es el servicio principal de la librería que proporciona métodos simplificados para realizar peticiones HTTP con configuración centralizada.

## Métodos del Servicio

### get()

Realiza una petición HTTP GET.

```typescript
get<T>(endpoint: string, options?: HttpOptions): Observable<T>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |
| options | HttpOptions | No | Opciones adicionales de la petición |
| T | generic | No | Tipo de dato de la respuesta |

**Retorna**: `Observable<T>` - Respuesta tipada del servidor

### post()

Realiza una petición HTTP POST.

```typescript
post<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |
| body | unknown | No | Cuerpo de la petición (default: {}) |
| options | HttpOptions | No | Opciones adicionales de la petición |
| T | generic | No | Tipo de dato de la respuesta |

**Retorna**: `Observable<T>` - Respuesta tipada del servidor

### put()

Realiza una petición HTTP PUT.

```typescript
put<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |
| body | unknown | No | Cuerpo de la petición (default: {}) |
| options | HttpOptions | No | Opciones adicionales de la petición |
| T | generic | No | Tipo de dato de la respuesta |

**Retorna**: `Observable<T>` - Respuesta tipada del servidor

### patch()

Realiza una petición HTTP PATCH.

```typescript
patch<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |
| body | unknown | No | Cuerpo de la petición (default: {}) |
| options | HttpOptions | No | Opciones adicionales de la petición |
| T | generic | No | Tipo de dato de la respuesta |

**Retorna**: `Observable<T>` - Respuesta tipada del servidor

### delete()

Realiza una petición HTTP DELETE.

```typescript
delete<T>(endpoint: string, options?: HttpOptions): Observable<T>
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |
| options | HttpOptions | No | Opciones adicionales de la petición |
| T | generic | No | Tipo de dato de la respuesta |

**Retorna**: `Observable<T>` - Respuesta tipada del servidor

### resolveUrl()

Resuelve URLs relativas contra la base URL configurada.

```typescript
resolveUrl(endpoint: string): string
```

| Parámetro | Tipo | Obligatorio | Descripción |
|-----------|------|-------------|-------------|
| endpoint | string | Sí | Endpoint relativo o URL absoluta |

**Retorna**: `string` - URL resuelta

**Comportamiento**:
- Si el endpoint comienza con `http://` o `https://`, se retorna tal cual
- Si hay base URL configurada, se combina con el endpoint
- Si no hay base URL, se retorna el endpoint con `/` inicial

## Ejemplos de Uso

### GET básico

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class UsersComponent {
  private apiService = inject(ApiService);

  users$ = this.apiService.get<User[]>('/users');
}
```

### GET con parámetros

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class UsersComponent {
  private apiService = inject(ApiService);

  getUsers(page: number = 1, limit: number = 10) {
    return this.apiService.get<User[]>('/users', {
      params: {
        page,
        limit,
        active: true
      }
    });
  }
}
```

### POST con body

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class CreateUserComponent {
  private apiService = inject(ApiService);

  createUser(userData: CreateUserDto) {
    return this.apiService.post<User>('/users', userData);
  }
}
```

### PUT para actualizar

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class UpdateUserComponent {
  private apiService = inject(ApiService);

  updateUser(id: string, userData: UpdateUserDto) {
    return this.apiService.put<User>(`/users/${id}`, userData);
  }
}
```

### PATCH para actualización parcial

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class UpdateUserComponent {
  private apiService = inject(ApiService);

  partialUpdateUser(id: string, partialData: Partial<User>) {
    return this.apiService.patch<User>(`/users/${id}`, partialData);
  }
}
```

### DELETE

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class DeleteUserComponent {
  private apiService = inject(ApiService);

  deleteUser(id: string) {
    return this.apiService.delete<void>(`/users/${id}`);
  }
}
```

### GET con headers personalizados

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getSecureData() {
    return this.apiService.get<any>('/secure-data', {
      headers: {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer custom-token'
      }
    });
  }
}
```

### URLs absolutas (ignoran base URL)

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class ExternalApiComponent {
  private apiService = inject(ApiService);

  getExternalData() {
    // URLs absolutas ignoran la base URL configurada
    return this.apiService.get<any>('https://external-api.com/data');
  }
}
```

### Manejo de errores

```typescript
import { ApiService } from '@lumen/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  // ...
})
export class UsersComponent {
  private apiService = inject(ApiService);

  getUsers() {
    return this.apiService.get<User[]>('/users').pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        // Manejo específico de errores
        if (error.status === 404) {
          return throwError(() => new Error('Users not found'));
        }
        return throwError(() => error);
      })
    );
  }
}
```

### Uso con async/await

```typescript
import { ApiService } from '@lumen/http';

@Component({
  // ...
})
export class UsersComponent {
  private apiService = inject(ApiService);

  async loadUsers() {
    try {
      const users = await firstValueFrom(
        this.apiService.get<User[]>('/users')
      );
      console.log('Users loaded:', users);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }
}
```

### Peticiones en paralelo

```typescript
import { ApiService } from '@lumen/http';
import { forkJoin } from 'rxjs';

@Component({
  // ...
})
export class DashboardComponent {
  private apiService = inject(ApiService);

  loadDashboardData() {
    return forkJoin({
      users: this.apiService.get<User[]>('/users'),
      posts: this.apiService.get<Post[]>('/posts'),
      stats: this.apiService.get<Stats>('/stats')
    });
  }
}
```

### Peticiones secuenciales

```typescript
import { ApiService } from '@lumen/http';
import { switchMap } from 'rxjs/operators';

@Component({
  // ...
})
export class UserDetailComponent {
  private apiService = inject(ApiService);

  getUserWithPosts(userId: string) {
    return this.apiService.get<User>(`/users/${userId}`).pipe(
      switchMap(user => {
        return this.apiService.get<Post[]>(`/users/${userId}/posts`).pipe(
          map(posts => ({ user, posts }))
        );
      })
    );
  }
}
```

### Tipado de respuestas

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface CreateUserDto {
  name: string;
  email: string;
  password: string;
}

@Component({
  // ...
})
export class UsersComponent {
  private apiService = inject(ApiService);

  // Respuesta tipada como User[]
  getUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users');
  }

  // Respuesta tipada como User
  createUser(userData: CreateUserDto): Observable<User> {
    return this.apiService.post<User>('/users', userData);
  }
}
```

### Uso de parámetros complejos

```typescript
@Component({
  // ...
})
export class ProductsComponent {
  private apiService = inject(ApiService);

  searchProducts(filters: ProductFilters) {
    return this.apiService.get<Product[]>('/products', {
      params: {
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        tags: filters.tags, // Array - se convertirá a múltiples parámetros
        active: true
      }
    });
  }
}
```

### Configuración de contexto

```typescript
import { HttpContext } from '@angular/common/http';

@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithContext() {
    const context = new HttpContext();
    // Configurar contexto personalizado
    return this.apiService.get<any>('/data', { context });
  }
}
```

### With credentials

```typescript
@Component({
  // ...
})
export class DataComponent {
  private apiService = inject(ApiService);

  getDataWithCredentials() {
    return this.apiService.get<any>('/data', {
      withCredentials: true
    });
  }
}
```

## Mejores Prácticas

### 1. Siempre tipar las respuestas

```typescript
// ✅ Bueno
getUsers(): Observable<User[]> {
  return this.apiService.get<User[]>('/users');
}

// ❌ Malo
getUsers() {
  return this.apiService.get('/users');
}
```

### 2. Crear servicios específicos por dominio

```typescript
@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<User[]>('/users');
  }

  getById(id: string) {
    return this.api.get<User>(`/users/${id}`);
  }

  create(data: CreateUserDto) {
    return this.api.post<User>('/users', data);
  }

  update(id: string, data: UpdateUserDto) {
    return this.api.put<User>(`/users/${id}`, data);
  }

  delete(id: string) {
    return this.api.delete<void>(`/users/${id}`);
  }
}
```

### 3. Manejo centralizado de errores

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  // ... código existente ...

  private handleError(error: any) {
    console.error('API Error:', error);
    // Lógica centralizada de manejo de errores
    return throwError(() => error);
  }
}
```

### 4. Usar constantes para endpoints

```typescript
const API_ENDPOINTS = {
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_POSTS: (id: string) => `/users/${id}/posts`,
} as const;

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);

  getAll() {
    return this.api.get<User[]>(API_ENDPOINTS.USERS);
  }
}
```
