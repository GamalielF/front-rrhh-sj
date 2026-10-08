---
sidebar_position: 3
id: ui-input
title: Input Component
description: Componente de input con validación y Reactive Forms.
---

# Input Component

Componente de input de formulario con validación integrada, soporte para Reactive Forms y múltiples variantes.

## Selector

```html
<ui-input></ui-input>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| label | string | '' | Etiqueta del campo |
| placeholder | string | '' | Texto de placeholder |
| type | InputType | 'text' | Tipo de input (text, password, email, number, etc.) |
| size | InputSize | 'md' | Tamaño del input |
| hint | string | '' | Texto de ayuda o hint |
| errorMessage | string | '' | Mensaje de error personalizado |
| customErrorMessages | Record\<string, string\> | undefined | Mensajes de error personalizados por validador |
| prefixIcon | string | '' | Icono prefijo (formato @tui.*) |
| suffixIcon | string | '' | Icono sufijo (formato @tui.*) |
| min | number \| string | undefined | Valor mínimo (para number/date) |
| max | number \| string | undefined | Valor máximo (para number/date) |
| step | number | undefined | Incremento (para number) |
| required | boolean | false | Campo requerido |
| readonly | boolean | false | Campo de solo lectura |
| showErrorsWhen | 'touched' \| 'dirty' \| 'always' | 'touched' | Cuándo mostrar errores |

## Tipos de Input

| Tipo | Descripción |
|------|-------------|
| text | Texto simple |
| password | Contraseña (oculta caracteres) |
| email | Email con validación |
| number | Numérico |
| tel | Teléfono |
| url | URL |
| search | Búsqueda |
| date | Fecha |
| time | Hora |

## Tamaños

| Tamaño | Altura | Tamaño de texto |
|--------|--------|-----------------|
| sm | 36px | text-xs |
| md | 44px (default) | text-sm |
| lg | 48px | text-base |

## ControlValueAccessor

El componente implementa `ControlValueAccessor` para usar con Reactive Forms:

- **writeValue**: Actualiza el valor del input
- **registerOnChange**: Registra callback de cambio
- **registerOnTouched**: Registra callback de touched
- **setDisabledState**: Habilita/deshabilita el input

## Ejemplos de Uso

### Input básico

```typescript
import { InputComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Nombre"
      placeholder="Ingrese su nombre">
    </ui-input>
  `
})
export class ExampleComponent {}
```

### Input con Reactive Forms

```typescript
import { InputComponent } from '@lumen/ui';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-example',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule],
  template: `
    <ui-input
      label="Email"
      placeholder="ejemplo@correo.com"
      [formControl]="emailControl">
    </ui-input>
  `
})
export class FormExampleComponent {
  emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
}
```

### Input de contraseña

```typescript
@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Contraseña"
      type="password"
      placeholder="••••••••"
      [formControl]="passwordControl">
    </ui-input>
  `
})
export class PasswordInputComponent {
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8)
  ]);
}
```

### Input numérico

```typescript
@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Cantidad"
      type="number"
      placeholder="0"
      [min]="0"
      [max]="100"
      [step]="1"
      [formControl]="quantityControl">
    </ui-input>
  `
})
export class NumberInputComponent {
  quantityControl = new FormControl(1);
}
```

### Input con iconos

```typescript
@Component({
  selector: 'app-icon-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Buscar"
      placeholder="Buscar elementos..."
      prefixIcon="@tui.search"
      [formControl]="searchControl">
    </ui-input>

    <ui-input
      label="Email"
      placeholder="correo@ejemplo.com"
      suffixIcon="@tui.mail"
      [formControl]="emailControl">
    </ui-input>
  `
})
export class IconInputComponent {
  searchControl = new FormControl('');
  emailControl = new FormControl('');
}
```

### Input con hint

```typescript
@Component({
  selector: 'app-hint-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Usuario"
      placeholder="nombre_de_usuario"
      hint="Mínimo 3 caracteres, solo letras y números"
      [formControl]="usernameControl">
    </ui-input>
  `
})
export class HintInputComponent {
  usernameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(3),
    Validators.pattern(/^[a-zA-Z0-9]+$/)
  ]);
}
```

### Input con error personalizado

```typescript
@Component({
  selector: 'app-error-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Email"
      type="email"
      placeholder="correo@ejemplo.com"
      errorMessage="Por favor ingrese un email válido"
      [formControl]="emailControl">
    </ui-input>
  `
})
export class ErrorInputComponent {
  emailControl = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
}
```

### Input con mensajes de error personalizados

```typescript
@Component({
  selector: 'app-custom-errors-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Contraseña"
      type="password"
      placeholder="••••••••"
      [customErrorMessages]="errorMessages"
      [formControl]="passwordControl">
    </ui-input>
  `
})
export class CustomErrorsInputComponent {
  errorMessages = {
    required: 'La contraseña es obligatoria',
    minlength: 'Mínimo 8 caracteres',
    pattern: 'Debe incluir mayúsculas, minúsculas y números'
  };

  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  ]);
}
```

### Input requerido

```typescript
@Component({
  selector: 'app-required-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Nombre completo"
      placeholder="Juan Pérez"
      [required]="true"
      [formControl]="nameControl">
    </ui-input>
  `
})
export class RequiredInputComponent {
  nameControl = new FormControl('', Validators.required);
}
```

### Input readonly

```typescript
@Component({
  selector: 'app-readonly-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="ID de usuario"
      [readonly]="true"
      [formControl]="userIdControl">
    </ui-input>
  `
})
export class ReadonlyInputComponent {
  userIdControl = new FormControl('12345');
}
```

### Diferentes tamaños

```typescript
@Component({
  selector: 'app-size-inputs',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Pequeño"
      size="sm"
      placeholder="Input pequeño">
    </ui-input>

    <ui-input
      label="Mediano"
      size="md"
      placeholder="Input mediano">
    </ui-input>

    <ui-input
      label="Grande"
      size="lg"
      placeholder="Input grande">
    </ui-input>
  `
})
export class SizeInputsComponent {}
```

### Control de visualización de errores

```typescript
@Component({
  selector: 'app-error-display-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Email"
      type="email"
      showErrorsWhen="always"
      [formControl]="emailControl">
    </ui-input>

    <ui-input
      label="Contraseña"
      type="password"
      showErrorsWhen="dirty"
      [formControl]="passwordControl">
    </ui-input>
  `
})
export class ErrorDisplayInputComponent {
  emailControl = new FormControl('', Validators.email);
  passwordControl = new FormControl('', Validators.required);
}
```

### Formulario completo

```typescript
@Component({
  selector: 'app-complete-form',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule, ButtonComponent],
  template: `
    <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
      <ui-input
        label="Nombre"
        placeholder="Juan Pérez"
        [formControl]="userForm.controls.name">
      </ui-input>

      <ui-input
        label="Email"
        type="email"
        placeholder="juan@ejemplo.com"
        [formControl]="userForm.controls.email">
      </ui-input>

      <ui-input
        label="Teléfono"
        type="tel"
        placeholder="+593 99 123 4567"
        [formControl]="userForm.controls.phone">
      </ui-input>

      <ui-button
        type="submit"
        variant="primary"
        [disabled]="userForm.invalid">
        Registrar
      </ui-button>
    </form>
  `
})
export class CompleteFormComponent {
  userForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.pattern(/^\+?[0-9]{10,15}$/))
  });

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Formulario válido:', this.userForm.value);
    }
  }
}
```

### Input deshabilitado dinámicamente

```typescript
@Component({
  selector: 'app-dynamic-input',
  standalone: true,
  imports: [InputComponent],
  template: `
    <ui-input
      label="Código postal"
      placeholder="010101"
      [formControl]="postalCodeControl">
    </ui-input>

    <ui-input
      label="Ciudad"
      placeholder="Ciudad"
      [readonly]="!isCityEditable"
      [formControl]="cityControl">
    </ui-input>
  `
})
export class DynamicInputComponent {
  postalCodeControl = new FormControl('');
  cityControl = new FormControl({ value: '', disabled: true });
  isCityEditable = false;

  constructor() {
    this.postalCodeControl.valueChanges.subscribe(code => {
      // Habilitar ciudad solo cuando hay código postal
      this.isCityEditable = !!code;
      if (this.isCityEditable) {
        this.cityControl.enable();
      } else {
        this.cityControl.disable();
      }
    });
  }
}
```

## Accesibilidad

El componente incluye características de accesibilidad:

- **Labels**: Asociados correctamente con los inputs
- **ARIA attributes**: Atributos ARIA apropiados
- **Error indication**: Indicadores visuales de error
- **Keyboard navigation**: Navegación por teclado estándar
- **Screen reader support**: Soporte para lectores de pantalla

## Validación

El componente soporta validación a través de Reactive Forms:

- **Validadores estándar**: `required`, `minLength`, `maxLength`, `pattern`, `email`, etc.
- **Validadores personalizados**: Puedes agregar validadores custom
- **Mensajes personalizados**: Usa `customErrorMessages` para personalizar mensajes
- **Error display**: Controla cuándo mostrar errores con `showErrorsWhen`

## Mejores Prácticas

1. **Siempre usa labels**: Proporciona etiquetas descriptivas
2. **Usa hints para ayuda**: Agrega `hint` para instrucciones adicionales
3. **Validación apropiada**: Usa validadores según el tipo de dato
4. **Mensajes de error claros**: Personaliza mensajes para mejor UX
5. **Tamaño consistente**: Usa el mismo tamaño en formularios consistentes

## Consideraciones

- El componente requiere `ReactiveFormsModule` para uso con formularios reactivos
- Los iconos usan el formato `@tui.icon-name` de Taiga UI
- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
- Los errores se muestran según la configuración de `showErrorsWhen`
- Soporta detección automática de `required` desde validadores
