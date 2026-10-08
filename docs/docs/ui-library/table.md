---
sidebar_position: 9
id: ui-table
title: Table Component
description: Componente de tabla avanzado con acciones y selección.
---

# Table Component

Componente de tabla avanzado con soporte para ordenamiento, selección, acciones personalizadas y diferentes tipos de columnas.

## Selector

```html
<ui-table></ui-table>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| columns | TableColumn\<T\>[] | [] | Definición de columnas |
| data | T[] | [] | Datos a mostrar |
| loading | boolean | false | Estado de carga |
| selectable | boolean | false | Habilitar selección de filas |
| selectedRows | T[] | [] | Filas seleccionadas |
| actions | TableAction\<T\>[] | [] | Acciones disponibles por fila |
| actionsLayout | TableActionsLayout | 'dropdown' | Layout de acciones ('dropdown', 'buttons', 'auto') |
| actionsTriggerIcon | string | '@tui.ellipsis-vertical' | Icono del trigger de acciones |
| actionsTriggerVariant | DropdownTriggerVariant | 'ghost' | Variante del trigger |
| actionsMenuTitle | string | '' | Título del menú de acciones |
| actionsColumnTitle | string | 'Acciones' | Título de columna de acciones |
| emptyMessage | string | 'No se encontraron registros' | Mensaje cuando no hay datos |
| trackByKey | string | '' | Key para trackBy de filas |
| skeletonCount | number | 5 | Número de filas skeleton |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| selectionChange | `EventEmitter<T[]>` | Emitido cuando cambia la selección |
| actionClick | `EventEmitter<{row: T, action: TableAction<T>, index: number}>` | Emitido cuando se click en acción |

## Tipos de Columna

| Tipo | Descripción | Formato |
|------|-------------|---------|
| text | Texto simple | Texto directo |
| badge | Badge con variante | Badge coloreado |
| currency | Formato moneda | $1,234.56 |
| date | Formato fecha | DD/MM/YYYY |
| number | Formato numérico | 1,234.56 |
| custom | Renderizado personalizado | Template personalizado |

## Ejemplos de Uso

### Tabla básica

```typescript
import { TableComponent } from '@lumen/ui';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  selector: 'app-basic-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table [columns]="columns" [data]="users"></ui-table>
  `
})
export class BasicTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Rol' },
  ];

  users: User[] = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com', role: 'Admin' },
    { id: 2, name: 'María García', email: 'maria@example.com', role: 'User' },
  ];
}
```

### Tabla con badges

```typescript
@Component({
  selector: 'app-badge-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table [columns]="columns" [data]="users"></ui-table>
  `
})
export class BadgeTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    {
      key: 'role',
      title: 'Rol',
      type: 'badge',
      badgeVariant: (row) => {
        switch (row.role) {
          case 'Admin': return 'danger';
          case 'Manager': return 'warning';
          default: return 'success';
        }
      }
    },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', role: 'Admin' },
    { id: 2, name: 'María', role: 'Manager' },
    { id: 3, name: 'Pedro', role: 'User' },
  ];
}
```

### Tabla con formato moneda

```typescript
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Component({
  selector: 'app-currency-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table [columns]="columns" [data]="products"></ui-table>
  `
})
export class CurrencyTableComponent {
  columns: TableColumn<Product>[] = [
    { key: 'name', title: 'Producto' },
    { key: 'price', title: 'Precio', type: 'currency', prefix: '$' },
    { key: 'stock', title: 'Stock', type: 'number' },
  ];

  products: Product[] = [
    { id: 1, name: 'Laptop', price: 999.99, stock: 15 },
    { id: 2, name: 'Mouse', price: 29.99, stock: 50 },
  ];
}
```

### Tabla con selección

```typescript
@Component({
  selector: 'app-selectable-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [selectable]="true"
      [selectedRows]="selectedUsers"
      (selectionChange)="onSelectionChange($event)">
    </ui-table>

    <p>Seleccionados: {{ selectedUsers.length }}</p>
  `
})
export class SelectableTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com' },
    { id: 2, name: 'María', email: 'maria@example.com' },
  ];

  selectedUsers: User[] = [];

  onSelectionChange(selected: User[]) {
    this.selectedUsers = selected;
    console.log('Seleccionados:', selected);
  }
}
```

### Tabla con acciones

```typescript
@Component({
  selector: 'app-actions-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [actions]="actions"
      (actionClick)="onActionClick($event)">
    </ui-table>
  `
})
export class ActionsTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
  ];

  actions: TableAction<User>[] = [
    {
      label: 'Editar',
      icon: '@tui.edit',
      variant: 'primary',
      onClick: (user) => this.editUser(user)
    },
    {
      label: 'Eliminar',
      icon: '@tui.trash',
      variant: 'danger',
      onClick: (user) => this.deleteUser(user)
    },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com' },
    { id: 2, name: 'María', email: 'maria@example.com' },
  ];

  editUser(user: User) {
    console.log('Editar:', user);
  }

  deleteUser(user: User) {
    console.log('Eliminar:', user);
  }

  onActionClick(event: any) {
    console.log('Acción:', event);
  }
}
```

### Tabla con acciones en botones

```typescript
@Component({
  selector: 'app-button-actions-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [actions]="actions"
      actionsLayout="buttons">
    </ui-table>
  `
})
export class ButtonActionsTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
  ];

  actions: TableAction<User>[] = [
    {
      label: 'Ver',
      icon: '@tui.eye',
      variant: 'secondary',
      onClick: (user) => this.viewUser(user)
    },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com' },
  ];

  viewUser(user: User) {
    console.log('Ver:', user);
  }
}
```

### Tabla con loading state

```typescript
@Component({
  selector: 'app-loading-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [loading]="isLoading">
    </ui-table>
  `
})
export class LoadingTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
  ];

  users: User[] = [];
  isLoading = true;

  constructor() {
    // Simular carga
    setTimeout(() => {
      this.users = [
        { id: 1, name: 'Juan', email: 'juan@example.com' },
      ];
      this.isLoading = false;
    }, 2000);
  }
}
```

### Tabla con columnas condicionales

```typescript
@Component({
  selector: 'app-conditional-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="displayedColumns"
      [data]="users">
    </ui-table>

    <button (click)="toggleRoleColumn()">
      {{ showRoleColumn ? 'Ocultar' : 'Mostrar' }} Rol
    </button>
  `
})
export class ConditionalTableComponent {
  showRoleColumn = true;

  allColumns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
    { key: 'role', title: 'Rol' },
  ];

  get displayedColumns(): TableColumn<User>[] {
    return this.showRoleColumn
      ? this.allColumns
      : this.allColumns.filter(col => col.key !== 'role');
  }

  toggleRoleColumn() {
    this.showRoleColumn = !this.showRoleColumn;
  }

  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com', role: 'Admin' },
  ];
}
```

### Tabla con acciones condicionales

```typescript
@Component({
  selector: 'app-conditional-actions-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      [actions]="actions">
    </ui-table>
  `
})
export class ConditionalActionsTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'role', title: 'Rol' },
  ];

  actions: TableAction<User>[] = [
    {
      label: 'Editar',
      icon: '@tui.edit',
      variant: 'primary',
      disabled: (user) => user.role === 'Admin',
      onClick: (user) => this.editUser(user)
    },
    {
      label: 'Eliminar',
      icon: '@tui.trash',
      variant: 'danger',
      hidden: (user) => user.role === 'Admin',
      onClick: (user) => this.deleteUser(user)
    },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', role: 'Admin' },
    { id: 2, name: 'María', role: 'User' },
  ];

  editUser(user: User) {
    console.log('Editar:', user);
  }

  deleteUser(user: User) {
    console.log('Eliminar:', user);
  }
}
```

### Tabla con trackBy

```typescript
@Component({
  selector: 'app-trackby-table',
  standalone: true,
  imports: [TableComponent],
  template: `
    <ui-table
      [columns]="columns"
      [data]="users"
      trackByKey="id">
    </ui-table>
  `
})
export class TrackByTableComponent {
  columns: TableColumn<User>[] = [
    { key: 'name', title: 'Nombre' },
    { key: 'email', title: 'Email' },
  ];

  users: User[] = [
    { id: 1, name: 'Juan', email: 'juan@example.com' },
    { id: 2, name: 'María', email: 'maria@example.com' },
  ];
}
```

## Accesibilidad

El componente incluye características de accesibilidad:

- **ARIA attributes**: Atributos ARIA apropiados para tablas
- **Keyboard navigation**: Navegación por teclado
- **Screen reader support**: Soporte para lectores de pantalla
- **Semantic HTML**: Estructura semántica de tabla

## Mejores Prácticas

1. **Define columnas claramente**: Usa títulos descriptivos
2. **Usa tipos apropiados**: `badge` para estados, `currency` para dinero
3. **Acciones contextuales**: Muestra solo acciones relevantes
4. **Loading states**: Indica carga cuando sea necesario
5. **Empty states**: Proporciona mensajes claros cuando no hay datos

## Consideraciones

- El componente usa ChangeDetectionStrategy.OnPush para rendimiento
- Para grandes datasets, considera implementación de paginación
- Los datos deben ser inmutables para detección de cambios eficiente
- Usa `trackByKey` para optimizar rendimiento en listas grandes
- Las acciones pueden ser condicionales basadas en datos de la fila
