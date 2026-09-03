import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableColumn, TableAction } from './table.model';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';

const ACTION_BASE = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1';

const ACTION_VARIANT: Record<string, string> = {
  primary:   'bg-blue-50 text-[#1D4ED8] border-blue-200 hover:bg-blue-100 active:bg-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 active:bg-gray-300',
  brand:     'bg-emerald-50 text-[#15803D] border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200',
  danger:    'bg-red-50 text-[#B91C1C] border-red-200 hover:bg-red-100 active:bg-red-200',
  ghost:     'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
};

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, BadgeComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent<T extends Record<string, any> = Record<string, any>> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() selectedRows: T[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() emptyMessage = 'No se encontraron registros';
  @Input() trackByKey = '';
  @Input() skeletonCount = 5;

  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() actionClick = new EventEmitter<{ row: T; action: TableAction<T>; index: number }>();

  readonly skeletonWidths = ['w-16', 'w-24', 'w-32', 'w-40', 'w-28'];

  get skeletonRows(): number[] {
    return Array.from({ length: this.skeletonCount }, (_, i) => i);
  }

  get isAllSelected(): boolean {
    return this.data.length > 0 && this.selectedRows.length === this.data.length;
  }

  get isSomeSelected(): boolean {
    return this.selectedRows.length > 0 && !this.isAllSelected;
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionChange.emit(checked ? [...this.data] : []);
  }

  toggleRow(row: T): void {
    const idx = this.findIndex(row);
    const updated = idx > -1
      ? this.selectedRows.filter((_, i) => i !== idx)
      : [...this.selectedRows, row];
    this.selectionChange.emit(updated);
  }

  isSelected(row: T): boolean {
    return this.findIndex(row) > -1;
  }

  getValue(row: T, col: TableColumn<T>): any {
    return row[col.key];
  }

  isPrimaryColumn(col: TableColumn<T>): boolean {
    return col.key === this.columns[0]?.key;
  }

  getActionClass(action: TableAction<T>): string {
    return [ACTION_BASE, ACTION_VARIANT[action.variant ?? 'primary'] || ACTION_VARIANT['primary']].join(' ');
  }

  trackRow(_index: number, row: T): any {
    return this.trackByKey ? row[this.trackByKey] : row;
  }

  randomSkeletonWidth(): string {
    return this.skeletonWidths[Math.floor(Math.random() * this.skeletonWidths.length)];
  }

  private findIndex(row: T): number {
    if (this.trackByKey) {
      return this.selectedRows.findIndex(r => r[this.trackByKey] === row[this.trackByKey]);
    }
    return this.selectedRows.indexOf(row);
  }
}
