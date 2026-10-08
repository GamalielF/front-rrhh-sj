---
sidebar_position: 4
id: ui-card
title: Card Component
description: Componente de tarjeta contenedora con opciones de personalización.
---

# Card Component

Componente de tarjeta contenedora con opciones de personalización de estilo, bordes y padding.

## Selector

```html
<ui-card></ui-card>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| title | string | '' | Título de la tarjeta |
| subtitle | string | '' | Subtítulo de la tarjeta |
| elevated | boolean | true | Efecto de sombra/elevación |
| bordered | boolean | true | Borde alrededor de la tarjeta |
| noPadding | boolean | false | Eliminar padding interno |
| hasHeader | boolean | false | Mostrar header con título |
| hasFooter | boolean | false | Mostrar footer |
| headerIcon | boolean | false | Mostrar icono en el header |

## Ejemplos de Uso

### Card básica

```typescript
import { CardComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card>
      <p>Contenido de la tarjeta</p>
    </ui-card>
  `
})
export class ExampleComponent {}
```

### Card con título

```typescript
@Component({
  selector: 'app-titled-card',
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card
      title="Información del Usuario"
      subtitle="Detalles personales"
      [hasHeader]="true"
      [headerIcon]="true">
      <p>Contenido de la tarjeta</p>
    </ui-card>
  `
})
export class TitledCardComponent {}
```

### Card sin elevación

```typescript
@Component({
  selector: 'app-flat-card',
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card
      [elevated]="false"
      [bordered]="true">
      <p>Card plano con borde</p>
    </ui-card>
  `
})
export class FlatCardComponent {}
```

### Card sin padding

```typescript
@Component({
  selector: 'app-no-padding-card',
  standalone: true,
  imports: [CardComponent],
  template: `
    <ui-card
      [noPadding]="true">
      <div class="p-6">
        <p>Contenido con padding personalizado</p>
      </div>
    </ui-card>
  `
})
export class NoPaddingCardComponent {}
```

### Card con contenido complejo

```typescript
@Component({
  selector: 'app-complex-card',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  template: `
    <ui-card
      title="Panel de Control"
      [hasHeader]="true"
      [hasFooter]="true">
      <div class="space-y-4">
        <p>Estadísticas y métricas</p>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded">
            <h3 class="font-semibold">Usuarios</h3>
            <p class="text-2xl">1,234</p>
          </div>
          <div class="bg-gray-50 p-4 rounded">
            <h3 class="font-semibold">Ventas</h3>
            <p class="text-2xl">$45,678</p>
          </div>
        </div>
      </div>

      <ng-template #footer>
        <div class="flex justify-end gap-2 border-t pt-4">
          <ui-button variant="outline">Cancelar</ui-button>
          <ui-button variant="primary">Guardar</ui-button>
        </div>
      </ng-template>
    </ui-card>
  `
})
export class ComplexCardComponent {}
```

### Grid de cards

```typescript
@Component({
  selector: 'app-card-grid',
  standalone: true,
  imports: [CardComponent],
  template: `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <ui-card title="Card 1" [hasHeader]="true">
        <p>Contenido 1</p>
      </ui-card>

      <ui-card title="Card 2" [hasHeader]="true">
        <p>Contenido 2</p>
      </ui-card>

      <ui-card title="Card 3" [hasHeader]="true">
        <p>Contenido 3</p>
      </ui-card>
    </div>
  `
})
export class CardGridComponent {}
```

## Estilos y Variaciones

### Variaciones de elevación

```typescript
// Con elevación (default)
<ui-card [elevated]="true">Card con sombra</ui-card>

// Sin elevación
<ui-card [elevated]="false">Card plano</ui-card>
```

### Variaciones de borde

```typescript
// Con borde (default)
<ui-card [bordered]="true">Card con borde</ui-card>

// Sin borde
<ui-card [bordered]="false">Card sin borde</ui-card>
```

### Combinaciones

```typescript
// Plano sin borde
<ui-card [elevated]="false" [bordered]="false">
  Card minimalista
</ui-card>

// Elevado con borde
<ui-card [elevated]="true" [bordered]="true">
  Card completa
</ui-card>
```

## Casos de Uso Recomendados

1. **Contenedores de contenido**: Agrupar contenido relacionado
2. **Tarjetas de información**: Mostrar datos de manera estructurada
3. **Paneles de control**: Dashboards y estadísticas
4. **Formularios**: Contener formularios completos
5. **Listas de items**: Tarjetas individuales para cada item

## Mejores Prácticas

1. **Usa títulos descriptivos**: Ayuda a identificar el contenido
2. **Mantén consistencia**: Usa el mismo estilo de cards en similar contexto
3. **Contenido enfocado**: Cada card debe tener un propósito claro
4. **Responsive**: Usa grids para responsive design
5. **Jerarquía visual**: Usa diferentes estilos para diferenciar importancia

## Consideraciones

- El componente usa `rounded-xl` para bordes redondeados
- La sombra por defecto es `shadow-xs` con `hover:shadow-sm`
- El header y footer son opcionales y usan slots
- El padding por defecto es `p-6`
- El componente usa ChangeDetectionStrategy.OnPush
