---
sidebar_position: 1
id: ui-intro
title: UI Library
description: Componentes UI reutilizables y estilizados para aplicaciones Angular.
---

# UI Library

La librería `@lumen/ui` proporciona un conjunto completo de componentes UI reutilizables y estilizados para aplicaciones Angular. Basada en Tailwind CSS y con un diseño consistente y moderno.

## Características

- **Componentes standalone**: Todos los componentes son standalone de Angular
- **Tailwind CSS**: Estilizado con utilidades de Tailwind CSS
- **Type-safe**: Soporte completo de TypeScript
- **Customizable**: Componentes configurables mediante inputs
- **Responsive**: Diseño adaptativo para diferentes dispositivos
- **Accessible**: Componentes con accesibilidad integrada

## Componentes

La librería está organizada en las siguientes categorías:

### Components
- **Button**: Botones con múltiples variantes y tamaños
- **Input**: Inputs de formulario con validación
- **Card**: Tarjetas de contenido
- **Badge**: Badges indicadores de estado
- **Icon**: Iconos usando Taiga UI
- **Table**: Tablas de datos con acciones
- **Form**: Formularios con validación
- **Dropdown**: Menús desplegables
- **Modal**: Modales y diálogos
- **Breadcrumb**: Navegación breadcrumbs
- **Grid**: Sistema de grillas responsive
- **Pagination**: Paginación de contenido
- **KPI Card**: Tarjetas de indicadores clave
- **Link**: Enlaces estilizados
- **Page Container**: Contenedores de página
- **Page Header**: Encabezados de página
- **User Profile Menu**: Menú de perfil de usuario

### Layout
- **Dashboard Layout**: Layout de dashboard con sidebar

## Arquitectura

```
@lumen/ui
├── components/
│   ├── button/          - Botones con variantes
│   ├── input/           - Inputs de formulario
│   ├── card/            - Tarjetas de contenido
│   ├── badge/           - Badges de estado
│   ├── icon/            - Iconos Taiga UI
│   ├── table/           - Tablas de datos
│   ├── form/            - Formularios
│   ├── dropdown/        - Menús desplegables
│   ├── modal/           - Modales
│   ├── breadcrumb/      - Navegación breadcrumbs
│   ├── grid/            - Sistema de grillas
│   ├── pagination/      - Paginación
│   ├── kpi-card/        - Tarjetas KPI
│   ├── link/            - Enlaces
│   ├── page-container/  - Contenedores de página
│   ├── page-header/     - Encabezados
│   └── user-profile-menu/ - Menú de usuario
└── layout/
    └── dashboard-layout/ - Layout de dashboard
```

## Tema y Estilos

La librería utiliza una paleta de colores consistente:

- **Primary**: Azul (#3B82F6)
- **Brand**: Verde esmeralda
- **Danger**: Rojo (#DC2626)
- **Warning**: Amber
- **Success**: Verde esmeralda
- **Neutral**: Grises
- **Info**: Sky azul

## Ejemplo Rápido

```typescript
import { ButtonComponent, CardComponent, InputComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonComponent, CardComponent, InputComponent],
  template: `
    <ui-card [title]="'Formulario de Ejemplo'">
      <ui-input
        label="Nombre"
        placeholder="Ingrese su nombre">
      </ui-input>
      <ui-button
        variant="primary"
        (onClick)="handleSubmit()">
        Enviar
      </ui-button>
    </ui-card>
  `
})
export class ExampleComponent {
  handleSubmit() {
    console.log('Formulario enviado');
  }
}
```

## Próximos Pasos

Explora la documentación de cada componente para详细了解 su API y ejemplos de uso.
