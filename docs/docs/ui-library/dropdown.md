---
sidebar_position: 7
id: ui-dropdown
title: Dropdown Component
description: Componente de menú desplegable con iconos y variantes.
---

# Dropdown Component

Componente de menú desplegable con soporte para iconos, badges, variantes y posiciones personalizables.

## Selector

```html
<ui-dropdown></ui-dropdown>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| items | DropdownItem[] | [] | Items del menú desplegable |
| triggerIcon | string | '@tui.ellipsis-vertical' | Icono del trigger |
| triggerLabel | string | '' | Texto del trigger |
| triggerVariant | DropdownTriggerVariant | 'ghost' | Variante del trigger |
| triggerSize | DropdownTriggerSize | 'sm' | Tamaño del trigger |
| triggerClass | string | '' | Clases CSS adicionales del trigger |
| menuClass | string | '' | Clases CSS adicionales del menú |
| menuTitle | string | '' | Título del menú |
| placement | DropdownPlacement | 'bottom-end' | Posición del menú |
| disabled | boolean | false | Estado deshabilitado |
| closeOnClick | boolean | true | Cerrar al hacer click en item |
| ariaLabel | string | 'Opciones' | Etiqueta ARIA para accesibilidad |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| itemClick | EventEmitter\<DropdownItem\> | Emitido cuando se click en un item |
| openChange | EventEmitter\<boolean\> | Emitido cuando cambia estado abierto/cerrado |

## Posiciones

| Posición | Descripción |
|----------|-------------|
| bottom-end | Abajo a la derecha (default) |
| bottom-start | Abajo a la izquierda |
| bottom-center | Abajo centrado |
| top-end | Arriba a la derecha |
| top-start | Arriba a la izquierda |
| top-center | Arriba centrado |

## Variantes de Trigger

| Variante | Descripción |
|----------|-------------|
| ghost | Transparente con hover (default) |
| outline | Borde sin fondo |
| solid | Fondo sólido |

## Tamaños de Trigger

| Tamaño | Descripción |
|--------|-------------|
| sm | Pequeño (default) |
| md | Mediano |
| lg | Grande |

## Ejemplos de Uso

### Dropdown básico

```typescript
import { DropdownComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="menuItems"></ui-dropdown>
  `
})
export class ExampleComponent {
  menuItems = [
    { id: '1', label: 'Opción 1', onClick: () => console.log('Opción 1') },
    { id: '2', label: 'Opción 2', onClick: () => console.log('Opción 2') },
  ];
}
```

### Dropdown con iconos

```typescript
@Component({
  selector: 'app-icon-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="iconItems"></ui-dropdown>
  `
})
export class IconDropdownComponent {
  iconItems = [
    {
      id: 'profile',
      label: 'Perfil',
      icon: '@tui.user',
      onClick: () => this.goToProfile()
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: '@tui.settings',
      onClick: () => this.goToSettings()
    },
    {
      id: 'logout',
      label: 'Cerrar sesión',
      icon: '@tui.log-out',
      variant: 'danger',
      onClick: () => this.logout()
    },
  ];

  goToProfile() { console.log('Perfil'); }
  goToSettings() { console.log('Configuración'); }
  logout() { console.log('Logout'); }
}
```

### Dropdown con texto en trigger

```typescript
@Component({
  selector: 'app-text-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown
      triggerLabel="Acciones"
      [items]="actionItems">
    </ui-dropdown>
  `
})
export class TextDropdownComponent {
  actionItems = [
    { id: 'edit', label: 'Editar', onClick: () => console.log('Editar') },
    { id: 'delete', label: 'Eliminar', variant: 'danger', onClick: () => console.log('Eliminar') },
  ];
}
```

### Dropdown con badges

```typescript
@Component({
  selector: 'app-badge-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="badgedItems"></ui-dropdown>
  `
})
export class BadgeDropdownComponent {
  badgedItems = [
    {
      id: 'messages',
      label: 'Mensajes',
      icon: '@tui.message-square',
      badge: '3',
      onClick: () => console.log('Mensajes')
    },
    {
      id: 'notifications',
      label: 'Notificaciones',
      icon: '@tui.bell',
      badge: '12',
      badgeVariant: 'danger',
      onClick: () => console.log('Notificaciones')
    },
  ];
}
```

### Dropdown con título de menú

```typescript
@Component({
  selector: 'app-titled-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown
      menuTitle="Acciones del usuario"
      [items]="userItems">
    </ui-dropdown>
  `
})
export class TitledDropdownComponent {
  userItems = [
    { id: 'profile', label: 'Mi Perfil', onClick: () => console.log('Perfil') },
    { id: 'settings', label: 'Configuración', onClick: () => console.log('Configuración') },
  ];
}
```

### Dropdown con diferentes posiciones

```typescript
@Component({
  selector: 'app-position-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <div class="flex gap-4">
      <ui-dropdown
        placement="bottom-start"
        [items]="items">
      </ui-dropdown>

      <ui-dropdown
        placement="bottom-center"
        [items]="items">
      </ui-dropdown>

      <ui-dropdown
        placement="bottom-end"
        [items]="items">
      </ui-dropdown>

      <ui-dropdown
        placement="top-end"
        [items]="items">
      </ui-dropdown>
    </div>
  `
})
export class PositionDropdownComponent {
  items = [
    { id: '1', label: 'Opción 1', onClick: () => console.log('1') },
    { id: '2', label: 'Opción 2', onClick: () => console.log('2') },
  ];
}
```

### Dropdown con variantes de items

```typescript
@Component({
  selector: 'app-variant-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="variantItems"></ui-dropdown>
  `
})
export class VariantDropdownComponent {
  variantItems = [
    {
      id: 'view',
      label: 'Ver',
      icon: '@tui.eye',
      variant: 'primary',
      onClick: () => console.log('Ver')
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: '@tui.edit',
      variant: 'brand',
      onClick: () => console.log('Editar')
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: '@tui.trash',
      variant: 'danger',
      onClick: () => console.log('Eliminar')
    },
  ];
}
```

### Dropdown con dividers

```typescript
@Component({
  selector: 'app-divider-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="dividedItems"></ui-dropdown>
  `
})
export class DividerDropdownComponent {
  dividedItems = [
    { id: 'profile', label: 'Perfil', onClick: () => console.log('Perfil') },
    { id: 'settings', label: 'Configuración', onClick: () => console.log('Configuración') },
    { divider: true },
    { id: 'logout', label: 'Cerrar sesión', variant: 'danger', onClick: () => console.log('Logout') },
  ];
}
```

### Dropdown con items deshabilitados

```typescript
@Component({
  selector: 'app-disabled-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="disabledItems"></ui-dropdown>
  `
})
export class DisabledDropdownComponent {
  disabledItems = [
    {
      id: 'edit',
      label: 'Editar',
      disabled: true,
      onClick: () => console.log('Editar')
    },
    {
      id: 'delete',
      label: 'Eliminar',
      disabled: false,
      onClick: () => console.log('Eliminar')
    },
  ];
}
```

### Dropdown con items condicionales

```typescript
@Component({
  selector: 'app-conditional-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="conditionalItems"></ui-dropdown>
  `
})
export class ConditionalDropdownComponent {
  isAdmin = true;

  get conditionalItems() {
    const items = [
      { id: 'profile', label: 'Perfil', onClick: () => console.log('Perfil') },
    ];

    if (this.isAdmin) {
      items.push(
        { id: 'admin', label: 'Panel Admin', onClick: () => console.log('Admin') },
        { divider: true },
        { id: 'settings', label: 'Configuración', onClick: () => console.log('Configuración') }
      );
    }

    items.push({
      id: 'logout',
      label: 'Cerrar sesión',
      variant: 'danger',
      onClick: () => console.log('Logout')
    });

    return items;
  }
}
```

### Dropdown con items ocultos dinámicamente

```typescript
@Component({
  selector: 'app-hidden-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="hiddenItems"></ui-dropdown>
  `
})
export class HiddenDropdownComponent {
  userRole = 'user';

  hiddenItems = [
    {
      id: 'profile',
      label: 'Perfil',
      hidden: () => false,
      onClick: () => console.log('Perfil')
    },
    {
      id: 'admin',
      label: 'Admin',
      hidden: () => this.userRole !== 'admin',
      onClick: () => console.log('Admin')
    },
    {
      id: 'settings',
      label: 'Configuración',
      hidden: () => this.userRole === 'guest',
      onClick: () => console.log('Configuración')
    },
  ];
}
```

### Dropdown con descripciones

```typescript
@Component({
  selector: 'app-description-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown [items]="describedItems"></ui-dropdown>
  `
})
export class DescriptionDropdownComponent {
  describedItems = [
    {
      id: 'export',
      label: 'Exportar',
      description: 'Exportar datos a CSV',
      icon: '@tui.download',
      onClick: () => console.log('Exportar')
    },
    {
      id: 'import',
      label: 'Importar',
      description: 'Importar datos desde archivo',
      icon: '@tui.upload',
      onClick: () => console.log('Importar')
    },
  ];
}
```

### Dropdown sin cerrar al click

```typescript
@Component({
  selector: 'app-persistent-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown
      [closeOnClick]="false"
      [items]="persistentItems">
    </ui-dropdown>
  `
})
export class PersistentDropdownComponent {
  persistentItems = [
    { id: '1', label: 'Opción 1', onClick: () => console.log('1') },
    { id: '2', label: 'Opción 2', onClick: () => console.log('2') },
  ];
}
```

### Dropdown con manejo de eventos

```typescript
@Component({
  selector: 'app-event-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown
      [items]="eventItems"
      (itemClick)="onItemClick($event)"
      (openChange)="onOpenChange($event)">
    </ui-dropdown>

    <p>Estado: {{ isOpen ? 'Abierto' : 'Cerrado' }}</p>
  `
})
export class EventDropdownComponent {
  isOpen = false;

  eventItems = [
    { id: '1', label: 'Opción 1', onClick: () => console.log('1') },
    { id: '2', label: 'Opción 2', onClick: () => console.log('2') },
  ];

  onItemClick(item: DropdownItem) {
    console.log('Item click:', item);
  }

  onOpenChange(isOpen: boolean) {
    this.isOpen = isOpen;
    console.log('Dropdown:', isOpen ? 'abierto' : 'cerrado');
  }
}
```

### Dropdown deshabilitado

```typescript
@Component({
  selector: 'app-disabled-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  template: `
    <ui-dropdown
      [disabled]="true"
      [items]="items">
    </ui-dropdown>
  `
})
export class DisabledDropdownComponent {
  items = [
    { id: '1', label: 'Opción 1', onClick: () => console.log('1') },
  ];
}
```

## Accesibilidad

El componente incluye características de accesibilidad:

- **ARIA attributes**: Atributos ARIA apropiados
- **Keyboard navigation**: Navegación por teclado
- **Focus management**: Gestión de foco
- **Escape key**: Cierre con tecla Escape
- **Click outside**: Cierre al hacer click fuera

## Mejores Prácticas

1. **Iconos descriptivos**: Usa iconos que representen la acción
2. **Dividers lógicos**: Agrupa items relacionados con dividers
3. **Variantes apropiadas**: Usa `danger` para acciones destructivas
4. **Badges informativos**: Usa badges para contadores y estados
5. **Items condicionales**: Muestra solo items relevantes al contexto

## Consideraciones

- El componente cierra automáticamente al hacer click fuera (click outside)
- El estado `disabled` deshabilita el trigger completamente
- Los items con `hidden: true` se filtran automáticamente
- Los dividers no tienen onClick y son visuales
- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
