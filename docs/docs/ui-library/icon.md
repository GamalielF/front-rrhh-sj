---
sidebar_position: 6
id: ui-icon
title: Icon Component
description: Componente de icono usando Taiga UI Icons.
---

# Icon Component

Componente de icono que utiliza Taiga UI Icons para mostrar iconos consistentes y escalables.

## Selector

```html
<ui-icon></ui-icon>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| icon | string | (required) | Nombre del icono (formato @tui.*) |
| size | IconSize | 'md' | Tamaño del icono |
| extraClass | string | '' | Clases CSS adicionales |

## Tamaños

| Tamaño | Clase Tailwind | Altura aproximada |
|--------|----------------|-------------------|
| xs | text-xs | 12px |
| sm | text-sm | 14px |
| md | text-base (default) | 16px |
| lg | text-lg | 18px |
| xl | text-2xl | 24px |

## Formato de Iconos

Los iconos usan el formato `@tui.icon-name` de Taiga UI. Algunos ejemplos comunes:

- `@tui.user` - Usuario
- `@tui.settings` - Configuración
- `@tui.home` - Casa
- `@tui.search` - Búsqueda
- `@tui.ellipsis-vertical` - Menú vertical
- `@tui.edit` - Editar
- `@tui.trash` - Eliminar
- `@tui.check` - Check/confirmar
- `@tui.x` - Cerrar/cancelar
- `@tui.chevron-down` - Flecha abajo

## Ejemplos de Uso

### Icono básico

```typescript
import { IconComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon icon="@tui.user"></ui-icon>
  `
})
export class ExampleComponent {}
```

### Diferentes tamaños

```typescript
@Component({
  selector: 'app-icon-sizes',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex items-center gap-4">
      <ui-icon icon="@tui.user" size="xs"></ui-icon>
      <ui-icon icon="@tui.user" size="sm"></ui-icon>
      <ui-icon icon="@tui.user" size="md"></ui-icon>
      <ui-icon icon="@tui.user" size="lg"></ui-icon>
      <ui-icon icon="@tui.user" size="xl"></ui-icon>
    </div>
  `
})
export class IconSizesComponent {}
```

### Icono con clases adicionales

```typescript
@Component({
  selector: 'app-custom-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon
      icon="@tui.user"
      size="lg"
      extraClass="text-blue-500">
    </ui-icon>

    <ui-icon
      icon="@tui.settings"
      size="md"
      extraClass="text-gray-400 hover:text-gray-600">
    </ui-icon>
  `
})
export class CustomIconComponent {}
```

### Icono con texto

```typescript
@Component({
  selector: 'app-icon-text',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex items-center gap-2">
      <ui-icon icon="@tui.search"></ui-icon>
      <span>Buscar</span>
    </div>

    <div class="flex items-center gap-2">
      <ui-icon icon="@tui.settings"></ui-icon>
      <span>Configuración</span>
    </div>
  `
})
export class IconTextComponent {}
```

### Icono en botón

```typescript
@Component({
  selector: 'app-button-icon',
  standalone: true,
  imports: [IconComponent, ButtonComponent],
  template: `
    <ui-button
      icon="@tui.save"
      iconPosition="start">
      Guardar
    </ui-button>

    <ui-button
      icon="@tui.download"
      iconPosition="end">
      Descargar
    </ui-button>
  `
})
export class ButtonIconComponent {}
```

### Icono interactivo

```typescript
@Component({
  selector: 'app-interactive-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon
      icon="@tui.heart"
      size="lg"
      [extraClass]="isLiked ? 'text-red-500' : 'text-gray-400'"
      (click)="toggleLike()"
      class="cursor-pointer hover:scale-110 transition-transform">
    </ui-icon>
  `
})
export class InteractiveIconComponent {
  isLiked = false;

  toggleLike() {
    this.isLiked = !this.isLiked;
  }
}
```

### Icono condicional

```typescript
@Component({
  selector: 'app-conditional-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon [icon]="statusIcon"></ui-icon>
  `
})
export class ConditionalIconComponent {
  status: 'online' | 'offline' | 'away' = 'online';

  get statusIcon(): string {
    switch (this.status) {
      case 'online': return '@tui.check-circle';
      case 'offline': return '@tui.x-circle';
      case 'away': return '@tui.clock';
      default: return '@tui.help-circle';
    }
  }
}
```

### Icono en lista

```typescript
@Component({
  selector: 'app-list-icons',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ul class="space-y-2">
      <li *ngFor="let item of items" class="flex items-center gap-2">
        <ui-icon [icon]="item.icon" size="sm"></ui-icon>
        <span>{{ item.label }}</span>
      </li>
    </ul>
  `
})
export class ListIconsComponent {
  items = [
    { icon: '@tui.home', label: 'Inicio' },
    { icon: '@tui.user', label: 'Perfil' },
    { icon: '@tui.settings', label: 'Configuración' },
    { icon: '@tui.log-out', label: 'Cerrar sesión' },
  ];
}
```

### Icono con tooltip (simple)

```typescript
@Component({
  selector: 'app-tooltip-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="relative group">
      <ui-icon
        icon="@tui.help-circle"
        size="lg"
        class="cursor-pointer">
      </ui-icon>
      <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity">
        Ayuda
      </div>
    </div>
  `
})
export class TooltipIconComponent {}
```

### Icono animado

```typescript
@Component({
  selector: 'app-animated-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ui-icon
      icon="@tui.refresh-cw"
      size="lg"
      [extraClass]="isRefreshing ? 'animate-spin' : ''"
      (click)="refresh()"
      class="cursor-pointer">
    </ui-icon>
  `
})
export class AnimatedIconComponent {
  isRefreshing = false;

  refresh() {
    this.isRefreshing = true;
    setTimeout(() => {
      this.isRefreshing = false;
    }, 2000);
  }
}
```

### Icono de estado

```typescript
@Component({
  selector: 'app-status-icon',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="flex items-center gap-2">
      <ui-icon
        [icon]="statusIcon"
        [extraClass]="statusColor"
        size="sm">
      </ui-icon>
      <span>{{ statusText }}</span>
    </div>
  `
})
export class StatusIconComponent {
  status: 'success' | 'error' | 'warning' | 'info' = 'success';

  get statusIcon(): string {
    switch (this.status) {
      case 'success': return '@tui.check-circle';
      case 'error': return '@tui.x-circle';
      case 'warning': return '@tui.alert-triangle';
      case 'info': return '@tui.info';
      default: return '@tui.help-circle';
    }
  }

  get statusColor(): string {
    switch (this.status) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-red-500';
      case 'warning': return 'text-amber-500';
      case 'info': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }

  get statusText(): string {
    switch (this.status) {
      case 'success': return 'Completado';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Desconocido';
    }
  }
}
```

### Icono en navegación

```typescript
@Component({
  selector: 'app-nav-icon',
  standalone: true,
  imports: [IconComponent, RouterLink],
  template: `
    <nav class="flex gap-4">
      <a
        *ngFor="let item of navItems"
        [routerLink]="item.route"
        class="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100">
        <ui-icon [icon]="item.icon" size="sm"></ui-icon>
        <span>{{ item.label }}</span>
      </a>
    </nav>
  `
})
export class NavIconComponent {
  navItems = [
    { icon: '@tui.home', label: 'Inicio', route: '/home' },
    { icon: '@tui.users', label: 'Usuarios', route: '/users' },
    { icon: '@tui.settings', label: 'Configuración', route: '/settings' },
  ];
}
```

## Iconos Comunes

### Navegación
- `@tui.home` - Inicio
- `@tui.chevron-left` - Flecha izquierda
- `@tui.chevron-right` - Flecha derecha
- `@tui.chevron-up` - Flecha arriba
- `@tui.chevron-down` - Flecha abajo
- `@tui.chevrons-left` - Doble flecha izquierda
- `@tui.chevrons-right` - Doble flecha derecha

### Acciones
- `@tui.edit` - Editar
- `@tui.trash` - Eliminar
- `@tui.save` - Guardar
- `@tui.copy` - Copiar
- `@tui.download` - Descargar
- `@tui.upload` - Subir
- `@tui.refresh-cw` - Actualizar
- `@tui.search` - Buscar

### Usuario
- `@tui.user` - Usuario
- `@tui.users` - Usuarios
- `@tui.user-plus` - Agregar usuario
- `@tui.user-minus` - Eliminar usuario
- `@tui.user-check` - Usuario verificado
- `@tui.log-out` - Cerrar sesión

### Sistema
- `@tui.settings` - Configuración
- `@tui.bell` - Notificaciones
- `@tui.help-circle` - Ayuda
- `@tui.info` - Información
- `@tui.shield` - Seguridad
- `@tui.lock` - Bloquear
- `@tui.unlock` - Desbloquear

### Estados
- `@tui.check` - Check
- `@tui.check-circle` - Check círculo
- `@tui.x` - X
- `@tui.x-circle` - X círculo
- `@tui.alert-triangle` - Advertencia
- `@tui.alert-circle` - Alerta
- `@tui.loader` - Cargando

### Archivos
- `@tui.file` - Archivo
- `@tui.file-text` - Archivo texto
- `@tui.folder` - Carpeta
- `@tui.image` - Imagen
- `@tui.file-plus` - Nuevo archivo

## Casos de Uso Recomendados

1. **Navegación**: Iconos en menús y barras de navegación
2. **Acciones**: Iconos en botones y acciones rápidas
3. **Estados**: Indicadores visuales de estado
4. **Feedback**: Confirmaciones y advertencias
5. **Decorativo**: Elementos visuales y branding

## Mejores Prácticas

1. **Consistencia**: Usa los mismos iconos para acciones similares
2. **Tamaño apropiado**: Adapta el tamaño al contexto
3. **Accesibilidad**: Proporciona texto alternativo cuando sea necesario
4. **Color semántico**: Usa colores que indiquen el estado
5. **Hover states**: Agrega estados hover para interactividad

## Consideraciones

- Los iconos requieren `@taiga-ui/core` como dependencia
- El formato `@tui.icon-name` es específico de Taiga UI
- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
- Los iconos son SVG y escalables sin pérdida de calidad
- Para iconos personalizados, considera extender el componente
