---
sidebar_position: 5
id: ui-badge
title: Badge Component
description: Componente de badge para mostrar estados y categorías.
---

# Badge Component

Componente de badge/etiqueta para mostrar estados, categorías o información importante de manera visual.

## Selector

```html
<ui-badge></ui-badge>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| variant | BadgeVariant | 'info' | Variante de color del badge |
| size | BadgeSize | 'md' | Tamaño del badge |
| shape | BadgeShape | 'pill' | Forma del badge (pill o square) |
| showDot | boolean | false | Mostrar solo un punto indicador |
| value | string \| number | undefined | Texto o número a mostrar |

## Variantes

| Variante | Color base | Uso recomendado |
|----------|------------|-----------------|
| primary | Azul | Información primaria |
| info | Sky azul | Información general |
| warning | Amber | Advertencias |
| danger | Rojo | Errores o acciones destructivas |
| success | Verde esmeralda | Éxito o confirmación |
| neutral | Gris | Información neutra |
| brand | Verde marca | Acciones de marca |

## Tamaños

| Tamaño | Texto | Padding | Uso recomendado |
|--------|-------|---------|-----------------|
| xs | 11px | px-2 py-0.5 | Muy pequeño, compacto |
| sm | text-xs | px-2.5 py-0.5 | Pequeño |
| md | text-xs (default) | px-3 py-1 | Normal |
| lg | text-sm | px-3.5 py-1.5 | Grande |

## Formas

| Forma | Border radius | Uso recomendado |
|-------|---------------|-----------------|
| pill | rounded-full (default) | Badges estándar |
| square | rounded-md | Badges técnicos/cuadrados |

## Ejemplos de Uso

### Badge básico

```typescript
import { BadgeComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <ui-badge value="Nuevo"></ui-badge>
    <ui-badge [value]="3"></ui-badge>
  `
})
export class ExampleComponent {}
```

### Diferentes variantes

```typescript
@Component({
  selector: 'app-badge-variants',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex gap-2">
      <ui-badge variant="primary" value="Primary"></ui-badge>
      <ui-badge variant="info" value="Info"></ui-badge>
      <ui-badge variant="warning" value="Warning"></ui-badge>
      <ui-badge variant="danger" value="Danger"></ui-badge>
      <ui-badge variant="success" value="Success"></ui-badge>
      <ui-badge variant="neutral" value="Neutral"></ui-badge>
      <ui-badge variant="brand" value="Brand"></ui-badge>
    </div>
  `
})
export class BadgeVariantsComponent {}
```

### Diferentes tamaños

```typescript
@Component({
  selector: 'app-badge-sizes',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex items-center gap-2">
      <ui-badge size="xs" value="XS"></ui-badge>
      <ui-badge size="sm" value="SM"></ui-badge>
      <ui-badge size="md" value="MD"></ui-badge>
      <ui-badge size="lg" value="LG"></ui-badge>
    </div>
  `
})
export class BadgeSizesComponent {}
```

### Badge con punto indicador

```typescript
@Component({
  selector: 'app-dot-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <ui-badge variant="success" [showDot]="true"></ui-badge>
        <span>Activo</span>
      </div>

      <div class="flex items-center gap-2">
        <ui-badge variant="danger" [showDot]="true"></ui-badge>
        <span>Inactivo</span>
      </div>

      <div class="flex items-center gap-2">
        <ui-badge variant="warning" [showDot]="true"></ui-badge>
        <span>Pendiente</span>
      </div>
    </div>
  `
})
export class DotBadgeComponent {}
```

### Badge numérico

```typescript
@Component({
  selector: 'app-numeric-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex items-center gap-2">
      <span>Mensajes</span>
      <ui-badge variant="primary" [value]="messageCount"></ui-badge>
    </div>

    <div class="flex items-center gap-2">
      <span>Notificaciones</span>
      <ui-badge variant="danger" [value]="notificationCount"></ui-badge>
    </div>
  `
})
export class NumericBadgeComponent {
  messageCount = 5;
  notificationCount = 12;
}
```

### Badge con forma cuadrada

```typescript
@Component({
  selector: 'app-square-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex gap-2">
      <ui-badge
        variant="primary"
        shape="square"
        value="API">
      </ui-badge>

      <ui-badge
        variant="success"
        shape="square"
        value="v2.0">
      </ui-badge>

      <ui-badge
        variant="warning"
        shape="square"
        value="BETA">
      </ui-badge>
    </div>
  `
})
export class SquareBadgeComponent {}
```

### Badge dinámico según estado

```typescript
@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <ui-badge
      [variant]="getStatusVariant(user.status)"
      [value]="getStatusLabel(user.status)">
    </ui-badge>
  `
})
export class StatusBadgeComponent {
  user = {
    status: 'active'
  };

  getStatusVariant(status: string): BadgeVariant {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'neutral';
      case 'pending': return 'warning';
      case 'blocked': return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'pending': return 'Pendiente';
      case 'blocked': return 'Bloqueado';
      default: return status;
    }
  }
}
```

### Badge en lista de items

```typescript
@Component({
  selector: 'app-list-badges',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="space-y-2">
      <div *ngFor="let item of items" class="flex items-center justify-between p-3 bg-gray-50 rounded">
        <span>{{ item.name }}</span>
        <ui-badge
          [variant]="item.variant"
          [value]="item.status">
        </ui-badge>
      </div>
    </div>
  `
})
export class ListBadgesComponent {
  items = [
    { name: 'Servidor 1', status: 'Online', variant: 'success' as BadgeVariant },
    { name: 'Servidor 2', status: 'Offline', variant: 'danger' as BadgeVariant },
    { name: 'Servidor 3', status: 'Maintenance', variant: 'warning' as BadgeVariant },
  ];
}
```

### Badge con contador condicional

```typescript
@Component({
  selector: 'app-conditional-badge',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <div class="flex items-center gap-2">
      <span>Tareas</span>
      <ui-badge
        *ngIf="taskCount > 0"
        variant="primary"
        [value]="taskCount">
      </ui-badge>
    </div>
  `
})
export class ConditionalBadgeComponent {
  taskCount = 0;

  constructor() {
    // Simular cambios
    setTimeout(() => this.taskCount = 5, 2000);
  }
}
```

### Badge en tabla

```typescript
@Component({
  selector: 'app-table-badges',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <table class="w-full">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users">
          <td>{{ user.name }}</td>
          <td>
            <ui-badge variant="primary" [value]="user.role"></ui-badge>
          </td>
          <td>
            <ui-badge
              [variant]="getStatusVariant(user.status)"
              [value]="user.status">
            </ui-badge>
          </td>
        </tr>
      </tbody>
    </table>
  `
})
export class TableBadgesComponent {
  users = [
    { name: 'Juan', role: 'Admin', status: 'Active' },
    { name: 'María', role: 'User', status: 'Inactive' },
  ];

  getStatusVariant(status: string): BadgeVariant {
    return status === 'Active' ? 'success' : 'neutral';
  }
}
```

### Badge con icono (combinado)

```typescript
@Component({
  selector: 'app-icon-badge',
  standalone: true,
  imports: [BadgeComponent, IconComponent],
  template: `
    <div class="flex items-center gap-2">
      <ui-icon icon="@tui.bell"></ui-icon>
      <ui-badge
        variant="danger"
        [value]="notificationCount"
        *ngIf="notificationCount > 0">
      </ui-badge>
    </div>
  `
})
export class IconBadgeComponent {
  notificationCount = 3;
}
```

## Casos de Uso Recomendados

1. **Estados de usuario**: Activo, inactivo, pendiente
2. **Categorías**: Tags y etiquetas
3. **Contadores**: Notificaciones, mensajes
4. **Versiones**: Versiones de software
5. **Prioridades**: Alta, media, baja
6. **Estados de sistema**: Online, offline, mantenimiento

## Mejores Prácticas

1. **Usa variantes apropiadas**: `danger` para errores, `success` para éxito
2. **Mantén consistencia**: Usa las mismas variantes para estados similares
3. **Texto conciso**: Usa textos cortos y claros
4. **Contraste adecuado**: Asegura legibilidad del texto
5. **Uso de puntos**: Para indicadores de estado sin texto

## Consideraciones

- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
- Los colores siguen la paleta de diseño del sistema
- La forma `pill` es la más común y recomendada
- El modo `showDot` es ideal para indicadores de estado minimalistas
- Los badges son inline-flex por defecto
