---
sidebar_position: 2
id: ui-button
title: Button Component
description: Componente de botón con múltiples variantes y tamaños.
---

# Button Component

Componente de botón con múltiples variantes, tamaños y estados. Diseñado para ser consistente y accesible.

## Selector

```html
<ui-button></ui-button>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| variant | ButtonVariant | 'primary' | Variante visual del botón |
| size | ButtonSize | 'md' | Tamaño del botón |
| disabled | boolean | false | Estado deshabilitado |
| loading | boolean | false | Estado de carga |
| type | 'button' \| 'submit' \| 'reset' | 'button' | Tipo de botón HTML |
| icon | string | undefined | Icono a mostrar (formato @tui.*) |
| iconPosition | 'start' \| 'end' | 'start' | Posición del icono |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| onClick | EventEmitter\<MouseEvent\> | Emitido cuando se hace click en el botón |

## Variantes

| Variante | Descripción | Uso recomendado |
|----------|-------------|-----------------|
| primary | Acción principal azul | Acciones principales del formulario |
| secondary | Acción secundaria gris | Acciones alternativas |
| brand | Acción de marca verde | Acciones destacadas de marca |
| brand-blue | Azul de marca | Acciones corporativas |
| outline | Borde azul sin fondo | Acciones secundarias |
| ghost | Transparente con hover | Acciones sutiles |
| danger | Rojo para acciones destructivas | Eliminar, cancelar |
| success | Verde para confirmación | Guardar, confirmar |
| light | Claro para fondos oscuros | Acciones en fondos oscuros |

## Tamaños

| Tamaño | Descripción | Altura aproximada |
|--------|-------------|-------------------|
| xs | Extra pequeño | ~28px |
| sm | Pequeño | ~32px |
| md | Mediano (default) | ~40px |
| lg | Grande | ~48px |
| icon | Solo icono | ~32px |

## Ejemplos de Uso

### Botón básico

```typescript
import { ButtonComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button (onClick)="handleClick()">
      Click me
    </ui-button>
  `
})
export class ExampleComponent {
  handleClick() {
    console.log('Button clicked');
  }
}
```

### Diferentes variantes

```typescript
@Component({
  selector: 'app-button-variants',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex gap-2">
      <ui-button variant="primary">Primary</ui-button>
      <ui-button variant="secondary">Secondary</ui-button>
      <ui-button variant="brand">Brand</ui-button>
      <ui-button variant="danger">Danger</ui-button>
      <ui-button variant="success">Success</ui-button>
      <ui-button variant="outline">Outline</ui-button>
      <ui-button variant="ghost">Ghost</ui-button>
    </div>
  `
})
export class ButtonVariantsComponent {}
```

### Diferentes tamaños

```typescript
@Component({
  selector: 'app-button-sizes',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex items-center gap-2">
      <ui-button size="xs">Extra Small</ui-button>
      <ui-button size="sm">Small</ui-button>
      <ui-button size="md">Medium</ui-button>
      <ui-button size="lg">Large</ui-button>
    </div>
  `
})
export class ButtonSizesComponent {}
```

### Botón con icono

```typescript
@Component({
  selector: 'app-button-icon',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex gap-2">
      <ui-button icon="@tui.save" iconPosition="start">
        Guardar
      </ui-button>
      <ui-button icon="@tui.trash" variant="danger">
        Eliminar
      </ui-button>
      <ui-button icon="@tui.download" iconPosition="end">
        Descargar
      </ui-button>
    </div>
  `
})
export class ButtonIconComponent {}
```

### Botón de solo icono

```typescript
@Component({
  selector: 'app-icon-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      icon="@tui.settings"
      size="icon"
      variant="ghost"
      (onClick)="openSettings()">
    </ui-button>
  `
})
export class IconButtonComponent {
  openSettings() {
    console.log('Settings opened');
  }
}
```

### Botón deshabilitado

```typescript
@Component({
  selector: 'app-disabled-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      [disabled]="true"
      variant="primary">
      Botón deshabilitado
    </ui-button>
  `
})
export class DisabledButtonComponent {}
```

### Botón de carga

```typescript
@Component({
  selector: 'app-loading-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      [loading]="isLoading"
      variant="primary"
      (onClick)="handleSubmit()">
      {{ isLoading ? 'Procesando...' : 'Enviar' }}
    </ui-button>
  `
})
export class LoadingButtonComponent {
  isLoading = false;

  handleSubmit() {
    this.isLoading = true;
    // Simular proceso asíncrono
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }
}
```

### Botón de submit en formulario

```typescript
@Component({
  selector: 'app-form-button',
  standalone: true,
  imports: [ButtonComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="myForm" (ngSubmit)="onSubmit()">
      <!-- Campos del formulario -->
      <ui-button
        type="submit"
        variant="primary"
        [disabled]="myForm.invalid">
        Enviar formulario
      </ui-button>
    </form>
  `
})
export class FormButtonComponent {
  myForm = new FormGroup({
    // controles del formulario
  });

  onSubmit() {
    console.log('Formulario enviado');
  }
}
```

### Botón condicional

```typescript
@Component({
  selector: 'app-conditional-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      [variant]="canSave ? 'success' : 'secondary'"
      [disabled]="!canSave"
      (onClick)="save()">
      {{ canSave ? 'Guardar cambios' : 'Sin cambios' }}
    </ui-button>
  `
})
export class ConditionalButtonComponent {
  canSave = false;

  save() {
    console.log('Guardando...');
  }
}
```

### Grupo de botones

```typescript
@Component({
  selector: 'app-button-group',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div class="flex gap-2">
      <ui-button variant="outline">Cancelar</ui-button>
      <ui-button variant="primary">Confirmar</ui-button>
    </div>
  `
})
export class ButtonGroupComponent {}
```

### Botón con confirmación

```typescript
@Component({
  selector: 'app-confirm-button',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <ui-button
      variant="danger"
      (onClick)="confirmDelete()">
      Eliminar
    </ui-button>
  `
})
export class ConfirmButtonComponent {
  confirmDelete() {
    if (confirm('¿Está seguro de eliminar este elemento?')) {
      console.log('Elemento eliminado');
    }
  }
}
```

## Accesibilidad

El componente incluye las siguientes características de accesibilidad:

- **Atributo type**: Configurable para submit, reset o button
- **Estado disabled**: Visual y funcionalmente deshabilitado
- **Estado loading**: Indicador visual de carga
- **Keyboard navigation**: Navegación por teclado estándar

## Mejores Prácticas

1. **Usa variantes apropiadas**: `primary` para acciones principales, `danger` para destructivas
2. **Indica estados de carga**: Usa `loading` para operaciones asíncronas
3. **Botones de icono**: Usa `size="icon"` para botones que solo muestran iconos
4. **Formularios**: Usa `type="submit"` para botones en formularios
5. **Accesibilidad**: Proporciona texto descriptivo, no solo iconos

## Consideraciones

- Los iconos usan el formato `@tui.icon-name` de Taiga UI
- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
- El estado loading deshabilita el botón automáticamente
- El click no se emite si el botón está deshabilitado o en estado loading
