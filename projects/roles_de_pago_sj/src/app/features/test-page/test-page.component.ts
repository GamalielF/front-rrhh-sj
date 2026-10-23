import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PageContainerComponent,
  KpiCardComponent,
  InputComponent,
  ButtonComponent,
  TableComponent,
  TableColumn,
  DataTableComponent,
  DataTableColumn,
  DataTableState,
  SpringPageResponse,
  LinkComponent,
  CardComponent,
  GridComponent,
  GridItemComponent,
  FormComponent,
  FormValidators,
} from '@lumen/ui';

interface TestRow {
  id: string;
  name: string;
  category?: string;
  status?: string;
}

@Component({
  selector: 'app-test-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PageContainerComponent,
    KpiCardComponent,
    InputComponent,
    ButtonComponent,
    TableComponent,
    DataTableComponent,
    LinkComponent,
    CardComponent,
    GridComponent,
    GridItemComponent,
    FormComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './test-page.component.html',
  styleUrls: ['./test-page.component.css'],
})
export class TestPageComponent {
  private fb = inject(FormBuilder);

  testForm: FormGroup = this.fb.group({
    cedula: ['', [Validators.required, FormValidators.cedulaEcuatoriana]],
    monto: [100, [Validators.required, FormValidators.range(10, 1000)]],
  });

  // Tabla sin paginación
  readonly demoData: TestRow[] = [
    { id: '#001', name: 'A' },
    { id: '#002', name: 'B' },
  ];

  readonly columns: TableColumn<TestRow>[] = [
    { key: 'id', title: 'Código', type: 'text' },
    { key: 'name', title: 'Nombre', type: 'text' },
  ];

  // Tabla con paginación y más
  page = 0;
  pageSize = 5;
  activeQueryParams: Record<string, any> = {};

  readonly dataTableRows: TestRow[] = [
    { id: '#001', name: 'A', category: 'Cat 1', status: 'Activo' },
    { id: '#002', name: 'B', category: 'Cat 2', status: 'Pendiente' },
    { id: '#003', name: 'C', category: 'Cat 1', status: 'Activo' },
    { id: '#004', name: 'D', category: 'Cat 3', status: 'Inactivo' },
    { id: '#005', name: 'E', category: 'Cat 2', status: 'Activo' },
    { id: '#006', name: 'F', category: 'Cat 1', status: 'Pendiente' },
    { id: '#007', name: 'G', category: 'Cat 3', status: 'Activo' },
    { id: '#008', name: 'H', category: 'Cat 2', status: 'Inactivo' },
    { id: '#009', name: 'I', category: 'Cat 1', status: 'Activo' },
    { id: '#010', name: 'J', category: 'Cat 2', status: 'Pendiente' },
  ];

  readonly dataTableColumns: DataTableColumn<TestRow>[] = [
    {
      key: 'id',
      title: 'Código',
      type: 'text',
    },
    {
      key: 'name',
      title: 'Nombre',
      type: 'text',
      filters: [
        {
          type: 'text',
          label: 'Buscar',
          paramName: 'name',
          operators: ['contains'],
          defaultOperator: 'contains',
          texts: {
            placeholder: 'Filtrar nombre...',
          },
        },
      ],
    },
    {
      key: 'category',
      title: 'Categoría',
      type: 'text',
      filters: [
        {
          type: 'select',
          label: 'Categoría',
          paramName: 'category',
          operators: ['equals'],
          defaultOperator: 'equals',
          options: [
            { value: 'Cat 1', label: 'Cat 1' },
            { value: 'Cat 2', label: 'Cat 2' },
            { value: 'Cat 3', label: 'Cat 3' },
          ],
        },
      ],
    },
    {
      key: 'status',
      title: 'Estado',
      type: 'badge',
      badgeVariant: (row: TestRow) => {
        if (row.status === 'Activo') return 'success';
        if (row.status === 'Pendiente') return 'warning';
        return 'danger';
      },
    },
  ];

  get filteredRows(): TestRow[] {
    return this.dataTableRows.filter((row) => {
      if (this.activeQueryParams['name']) {
        const query = String(this.activeQueryParams['name']).toLowerCase();
        if (!row.name.toLowerCase().includes(query)) return false;
      }
      if (this.activeQueryParams['category']) {
        if (row.category !== this.activeQueryParams['category']) return false;
      }
      return true;
    });
  }

  get dataTableResponse(): SpringPageResponse<TestRow> {
    const filtered = this.filteredRows;
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    return {
      content: filtered.slice(start, end),
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / this.pageSize),
      number: this.page,
      size: this.pageSize,
    };
  }

  onPageChange(page: number): void {
    this.page = page;
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
  }

  onStateChange(state: DataTableState): void {
    this.page = state.page;
    this.pageSize = state.pageSize;
    this.activeQueryParams = state.queryParams || {};
  }

  onPrimaryAction(): void {
    if (this.testForm.valid) {
      console.log('Form data:', this.testForm.value);
    }
  }

  onSecondaryAction(): void {
    this.testForm.reset({ cedula: '', monto: 0 });
  }
}
