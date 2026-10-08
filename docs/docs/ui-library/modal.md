---
sidebar_position: 8
id: ui-modal
title: Modal Component
description: Componente de modal con diferentes tamaños y opciones.
---

# Modal Component

Componente de modal/diálogo con soporte para diferentes tamaños, cierre por backdrop y atajos de teclado.

## Selector

```html
<ui-modal></ui-modal>
```

## Inputs

| Input | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| isOpen | boolean | false | Estado del modal (abierto/cerrado) |
| title | string | '' | Título del modal |
| subtitle | string | '' | Subtítulo del modal |
| size | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'md' | Tamaño del modal |
| showClose | boolean | true | Mostrar botón de cerrar |
| closeOnBackdrop | boolean | true | Cerrar al hacer click en el backdrop |
| hasFooter | boolean | true | Mostrar footer del modal |

## Outputs

| Output | Tipo | Descripción |
|--------|------|-------------|
| close | EventEmitter\<void\> | Emitido cuando se cierra el modal |

## Tamaños

| Tamaño | Ancho máximo | Uso recomendado |
|--------|--------------|-----------------|
| sm | max-w-sm | Confirmaciones simples |
| md | max-w-lg (default) | Formularios pequeños |
| lg | max-w-2xl | Formularios grandes |
| xl | max-w-4xl | Contenido extenso |
| full | max-w-full | Pantalla completa |

## Ejemplos de Uso

### Modal básico

```typescript
import { ModalComponent } from '@lumen/ui';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button (onClick)="openModal()">Abrir Modal</ui-button>

    <ui-modal
      [isOpen]="isModalOpen"
      [title]="'Modal Básico'"
      (close)="closeModal()">
      <p>Contenido del modal</p>
    </ui-modal>
  `
})
export class ExampleComponent {
  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
```

### Modal con confirmación

```typescript
@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button
      variant="danger"
      (onClick)="openDeleteModal()">
      Eliminar
    </ui-button>

    <ui-modal
      [isOpen]="isDeleteModalOpen"
      [title]="'Confirmar Eliminación'"
      [subtitle]="'Esta acción no se puede deshacer'"
      [showClose]="true"
      (close)="closeDeleteModal()">
      <p class="text-gray-600">
        ¿Está seguro de que desea eliminar este elemento?
      </p>

      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <ui-button
            variant="outline"
            (onClick)="closeDeleteModal()">
            Cancelar
          </ui-button>
          <ui-button
            variant="danger"
            (onClick)="confirmDelete()">
            Eliminar
          </ui-button>
        </div>
      </ng-template>
    </ui-modal>
  `
})
export class ConfirmModalComponent {
  isDeleteModalOpen = false;

  openDeleteModal() {
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  confirmDelete() {
    console.log('Elemento eliminado');
    this.closeDeleteModal();
  }
}
```

### Modal con formulario

```typescript
@Component({
  selector: 'app-form-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, InputComponent, ReactiveFormsModule],
  template: `
    <ui-button (onClick)="openFormModal()">Nuevo Usuario</ui-button>

    <ui-modal
      [isOpen]="isFormModalOpen"
      [title]="'Crear Usuario'"
      size="lg"
      (close)="closeFormModal()">
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
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          [formControl]="userForm.controls.password">
        </ui-input>

        <ng-template #footer>
          <div class="flex justify-end gap-2">
            <ui-button
              type="button"
              variant="outline"
              (onClick)="closeFormModal()">
              Cancelar
            </ui-button>
            <ui-button
              type="submit"
              variant="primary"
              [disabled]="userForm.invalid">
              Crear
            </ui-button>
          </div>
        </ng-template>
      </form>
    </ui-modal>
  `
})
export class FormModalComponent {
  isFormModalOpen = false;
  userForm = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)])
  });

  openFormModal() {
    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
    this.userForm.reset();
  }

  onSubmit() {
    if (this.userForm.valid) {
      console.log('Usuario creado:', this.userForm.value);
      this.closeFormModal();
    }
  }
}
```

### Modal grande con contenido complejo

```typescript
@Component({
  selector: 'app-large-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button (onClick)="openLargeModal()">Ver Detalles</ui-button>

    <ui-modal
      [isOpen]="isLargeModalOpen"
      [title]="'Detalles del Proyecto'"
      [subtitle]="project.name"
      size="xl"
      (close)="closeLargeModal()">
      <div class="space-y-6">
        <div>
          <h3 class="font-semibold mb-2">Descripción</h3>
          <p class="text-gray-600">{{ project.description }}</p>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Equipo</h3>
          <div class="flex gap-2">
            <span *ngFor="let member of project.team"
                  class="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {{ member }}
            </span>
          </div>
        </div>

        <div>
          <h3 class="font-semibold mb-2">Progreso</h3>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full"
                 [style.width.%]="project.progress"></div>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ project.progress }}% completado</p>
        </div>
      </div>

      <ng-template #footer>
        <div class="flex justify-between">
          <ui-button variant="outline" (onClick)="closeLargeModal()">
            Cerrar
          </ui-button>
          <ui-button variant="primary" (onClick)="editProject()">
            Editar Proyecto
          </ui-button>
        </div>
      </ng-template>
    </ui-modal>
  `
})
export class LargeModalComponent {
  isLargeModalOpen = false;

  project = {
    name: 'Sistema de Gestión',
    description: 'Desarrollo de sistema completo para gestión empresarial',
    team: ['Juan', 'María', 'Pedro', 'Ana'],
    progress: 65
  };

  openLargeModal() {
    this.isLargeModalOpen = true;
  }

  closeLargeModal() {
    this.isLargeModalOpen = false;
  }

  editProject() {
    console.log('Editar proyecto');
    this.closeLargeModal();
  }
}
```

### Modal pantalla completa

```typescript
@Component({
  selector: 'app-fullscreen-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button (onClick)="openFullscreenModal()">Pantalla Completa</ui-button>

    <ui-modal
      [isOpen]="isFullscreenOpen"
      [title]="'Vista Extendida'"
      size="full"
      [showClose]="true"
      (close)="closeFullscreenModal()">
      <div class="h-full flex flex-col">
        <div class="flex-1 overflow-auto">
          <!-- Contenido extenso -->
          <div class="grid grid-cols-3 gap-4">
            <div *ngFor="let item of largeList" class="bg-gray-50 p-4 rounded">
              {{ item }}
            </div>
          </div>
        </div>
      </div>
    </ui-modal>
  '
})
export class FullscreenModalComponent {
  isFullscreenOpen = false;
  largeList = Array.from({ length: 50 }, (_, i) => `Item ${i + 1}`);

  openFullscreenModal() {
    this.isFullscreenOpen = true;
  }

  closeFullscreenModal() {
    this.isFullscreenOpen = false;
  }
}
```

### Modal sin cierre por backdrop

```typescript
@Component({
  selector: 'app-no-backdrop-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button (onClick)="openModal()">Abrir Modal</ui-button>

    <ui-modal
      [isOpen]="isModalOpen"
      [title]="'Modal Persistente'"
      [closeOnBackdrop]="false"
      (close)="closeModal()">
      <p>Este modal no se cierra al hacer click fuera.</p>
      <p>Debe usar el botón de cerrar o presionar ESC.</p>

      <ng-template #footer>
        <ui-button variant="primary" (onClick)="closeModal()">
          Entendido
        </ui-button>
      </ng-template>
    </ui-modal>
  `
})
export class NoBackdropModalComponent {
  isModalOpen = false;

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
```

### Modal pequeño (confirmación)

```typescript
@Component({
  selector: 'app-small-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent],
  template: `
    <ui-button
      variant="danger"
      (onClick)="openConfirmModal()">
      Borrar Cuenta
    </ui-button>

    <ui-modal
      [isOpen]="isConfirmOpen"
      [title]="'¿Está seguro?'"
      size="sm"
      (close)="closeConfirmModal()">
      <p class="text-gray-600">
        Esta acción eliminará permanentemente su cuenta.
      </p>

      <ng-template #footer>
        <div class="flex justify-end gap-2">
          <ui-button
            variant="outline"
            (onClick)="closeConfirmModal()">
            Cancelar
          </ui-button>
          <ui-button
            variant="danger"
            (onClick)="confirmAction()">
            Confirmar
          </ui-button>
        </div>
      </ng-template>
    </ui-modal>
  `
})
export class SmallModalComponent {
  isConfirmOpen = false;

  openConfirmModal() {
    this.isConfirmOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmOpen = false;
  }

  confirmAction() {
    console.log('Acción confirmada');
    this.closeConfirmModal();
  }
}
```

## Accesibilidad

El componente incluye características de accesibilidad:

- **Focus trap**: El foco se mantiene dentro del modal
- **ESC key**: Cierre con tecla Escape
- **Backdrop click**: Cierre al hacer click fuera (configurable)
- **ARIA attributes**: Atributos ARIA apropiados
- **Focus management**: Gestión de foco al abrir/cerrar

## Mejores Prácticas

1. **Tamaños apropiados**: Usa el tamaño según el contenido
2. **Títulos descriptivos**: Claros y concisos
3. **Acciones claras**: Botones de acción obvios
4. **Cierre intuitivo**: Múltiples formas de cerrar
5. **Contenido enfocado**: Un propósito claro por modal

## Consideraciones

- El modal usa `max-h-[90vh]` para no exceder el viewport
- El backdrop tiene fondo semitransparente
- El componente usa ChangeDetectionStrategy.OnPush
- Los slots `header` y `footer` son opcionales
- El cierre por backdrop se puede deshabilitar
