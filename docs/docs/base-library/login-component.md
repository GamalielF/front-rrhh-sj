---
sidebar_position: 3
id: base-login
title: LumenLoginComponent
description: Componente de página de login con integración auth.
---

# LumenLoginComponent

Componente de página de login preconfigurado con integración completa con el sistema de autenticación de `@lumen/auth`. Maneja el formulario de credenciales, validación y redirección automática.

## Selector

```html
<lumen-login></lumen-login>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| systemTitle | string | 'Portal Institucional' | Título del sistema/institución |
| systemDescription | string | 'Acceda con sus credenciales institucionales autorizadas.' | Descripción del sistema |
| logoSrc | string | 'img/logo-blue.png' | URL del logo del sistema |
| redirectUrl | string | '/home' | URL de redirección después del login exitoso |

## Propiedades Internas

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| loginForm | FormGroup | Formulario reactivo con campos username y password |
| isLoading | boolean | Estado de carga durante el proceso de login |
| errorMessage | string | Mensaje de error del login |

## Formulario

El componente utiliza un formulario reactivo con los siguientes campos:

### Campos del Formulario

| Campo | Tipo | Validadores | Descripción |
|-------|------|-------------|-------------|
| username | string | required | Nombre de usuario o email |
| password | string | required | Contraseña del usuario |

## Métodos

### onSubmit()

Maneja el envío del formulario de login.

```typescript
onSubmit(): void
```

**Comportamiento**:
1. Establece `isLoading` en `true`
2. Limpia mensajes de error anteriores
3. Extrae credenciales del formulario
4. Llama a `AuthService.login()`
5. Si el login es exitoso, redirige a `redirectUrl`
6. Si hay error, muestra el mensaje de error

## Ejemplos de Uso

### Uso básico

```typescript
import { LumenLoginComponent } from '@lumen/base';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login></lumen-login>
  `
})
export class LoginPageComponent {}
```

### Personalización de branding

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="'Cooperativa San José'"
      [systemDescription]="'Portal de Servicios Financieros'"
      [logoSrc]="'/assets/coopsanjose-logo.png'"
      [redirectUrl]="'/dashboard'">
    </lumen-login>
  `
})
export class CustomLoginPageComponent {}
```

### Configuración en routing

```typescript
import { Routes } from '@angular/router';
import { LumenLoginComponent } from '@lumen/base';
import { guestGuard } from '@lumen/auth';

const routes: Routes = [
  {
    path: 'login',
    component: LumenLoginComponent,
    canActivate: [guestGuard] // Solo accesible para no autenticados
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];
```

### Login con redirección dinámica

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="systemName"
      [redirectUrl]="intendedUrl">
    </lumen-login>
  `
})
export class SmartLoginComponent {
  systemName = 'Portal Empresarial';
  intendedUrl = '/dashboard';

  constructor(private router: Router) {
    // Recuperar URL intentada antes del login
    const savedUrl = localStorage.getItem('redirectUrl');
    if (savedUrl) {
      this.intendedUrl = savedUrl;
      localStorage.removeItem('redirectUrl');
    }
  }
}
```

### Configuración basada en ambiente

```typescript
import { environment } from '../environments/environment';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="environment.appName"
      [systemDescription]="environment.appDescription"
      [logoSrc]="environment.logoUrl"
      [redirectUrl]="environment.defaultRedirect">
    </lumen-login>
  `
})
export class EnvironmentLoginComponent {}
```

### Integración con servicio de configuración

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="config?.systemTitle || 'Cargando...'"
      [systemDescription]="config?.systemDescription"
      [logoSrc]="config?.logoUrl"
      [redirectUrl]="config?.defaultRedirect || '/home'">
    </lumen-login>
  `
})
export class ConfigurableLoginComponent {
  config: LoginConfig | null = null;

  constructor(private configService: ConfigService) {
    this.configService.getLoginConfig().subscribe(config => {
      this.config = config;
    });
  }
}
```

### Login multi-tenant

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="tenantConfig?.name"
      [systemDescription]="tenantConfig?.description"
      [logoSrc]="tenantConfig?.logo"
      [redirectUrl]="tenantConfig?.defaultRedirect">
    </lumen-login>
  `
})
export class MultiTenantLoginComponent {
  tenantConfig: TenantConfig | null = null;

  constructor(private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      const tenantId = params.get('tenantId');
      this.loadTenantConfig(tenantId);
    });
  }

  private loadTenantConfig(tenantId: string) {
    // Cargar configuración específica del tenant
  }
}
```

### Variante para login administrativo

```typescript
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <lumen-login
      [systemTitle]="'Panel de Administración'"
      [systemDescription]="'Acceso exclusivo para administradores del sistema'"
      [logoSrc]="'/assets/admin-logo.png'"
      [redirectUrl]="'/admin/dashboard'">
    </lumen-login>
  `
})
export class AdminLoginComponent {}
```

### Personalización con datos adicionales

```typescript
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LumenLoginComponent],
  template: `
    <div class="login-wrapper">
      <div class="login-sidebar">
        <!-- Contenido adicional (información, promociones, etc.) -->
      </div>
      <div class="login-content">
        <lumen-login
          [systemTitle]="systemTitle"
          [systemDescription]="systemDescription"
          [logoSrc]="logoSrc"
          [redirectUrl]="redirectUrl">
        </lumen-login>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      display: flex;
      min-height: 100vh;
    }
    .login-sidebar {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .login-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class EnhancedLoginComponent {
  systemTitle = 'Mi Portal';
  systemDescription = 'Acceso seguro';
  logoSrc = '/logo.png';
  redirectUrl = '/dashboard';
}
```

## Dependencias

El componente utiliza:

- **@lumen/auth**: `AuthService` para autenticación
- **@lumen/ui**: `InputComponent`, `ButtonComponent`, `FormComponent`
- **@angular/forms**: `FormBuilder`, `FormGroup`, `Validators`, `ReactiveFormsModule`
- **@angular/router**: `Router` para redirección

## Configuración Requerida

Para que el componente funcione correctamente, debes configurar `@lumen/auth`:

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

## Manejo de Errores

El componente maneja automáticamente los errores de login:

- **Error de conexión**: Muestra mensaje genérico de error
- **Credenciales inválidas**: Muestra mensaje del servidor o mensaje por defecto
- **Error del servidor**: Muestra el mensaje de error recibido

## Flujo de Autenticación

1. Usuario ingresa credenciales
2. Componente valida el formulario
3. Llama a `AuthService.login()`
4. Si es exitoso:
   - Guarda token y datos de usuario
   - Redirige a `redirectUrl`
5. Si falla:
   - Muestra mensaje de error
   - Permite reintentar

## Seguridad

- **Validación cliente**: Campos requeridos validados antes de enviar
- **HTTPS**: Se recomienda usar HTTPS en producción
- **Token management**: Tokens manejados por `AuthService`
- **CSRF**: Considerar implementar protección CSRF

## Casos de Uso Recomendados

1. **Login institucional**: Acceso a portales corporativos
2. **Login administrativo**: Panel de administración
3. **Login multi-tenant**: Sistemas con múltiples organizaciones
4. **Login white-label**: Personalización por cliente
5. **Login con branding**: Personalización de marca

## Consideraciones

- El componente asume que el endpoint de login retorna `{ accessToken, user }`
- Para flujos de autenticación personalizados, considera extender el componente
- La redirección después del login es configurable mediante `redirectUrl`
- Para recuperar la URL intentada, implementa lógica adicional
