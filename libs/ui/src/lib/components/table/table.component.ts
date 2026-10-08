import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { TableColumn, TableAction, TableActionsLayout } from './table.model';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { DropdownItem, DropdownTriggerVariant } from '../dropdown/dropdown.model';

const ACTION_BASE = 'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';

const ACTION_VARIANT: Record<string, string> = {
  primary:   'bg-blue-50 text-[#1D4ED8] border-blue-200 hover:bg-blue-100 active:bg-blue-200',
  secondary: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200 active:bg-gray-300',
  brand:     'bg-emerald-50 text-[#15803D] border-emerald-200 hover:bg-emerald-100 active:bg-emerald-200',
  danger:    'bg-red-50 text-[#B91C1C] border-red-200 hover:bg-red-100 active:bg-red-200',
  ghost:     'bg-transparent text-gray-600 border-transparent hover:bg-gray-100 hover:text-gray-900',
  warning:   'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 active:bg-amber-200',
  info:      'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 active:bg-sky-200',
  default:   'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 active:bg-gray-100 shadow-xs',
};

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, BadgeComponent, IconComponent, DropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css'],
})
export class TableComponent<T extends Record<string, any> = Record<string, any>> {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() selectable = false;
  @Input() selectedRows: T[] = [];
  @Input() actions: TableAction<T>[] = [];
  @Input() actionsLayout: TableActionsLayout = 'dropdown';
  @Input() actionsTriggerIcon = '@tui.ellipsis-vertical';
  @Input() actionsTriggerVariant: DropdownTriggerVariant = 'ghost';
  @Input() actionsMenuTitle = '';
  @Input() actionsColumnTitle = 'Acciones';
  @Input() emptyMessage = 'No se encontraron registros';
  @Input() trackByKey = '';
  @Input() skeletonCount = 5;
  @Input() fullHeight = false;

  @HostBinding('class.h-full')
  @HostBinding('class.flex-1')
  get isFullHeight(): boolean {
    return this.fullHeight;
  }

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

  get useDropdownLayout(): boolean {
    if (this.actionsLayout === 'buttons') return false;
    if (this.actionsLayout === 'dropdown') return true;
    return this.actions.length > 1;
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

  isActionDisabled(action: TableAction<T>, row: T): boolean {
    return typeof action.disabled === 'function' ? action.disabled(row) : !!action.disabled;
  }

  getRowDropdownItems(row: T): DropdownItem<T>[] {
    return this.actions.map((action, index) => {
      const badge = typeof action.badge === 'function' ? action.badge(row) : action.badge;
      const badgeVariant = typeof action.badgeVariant === 'function' ? action.badgeVariant(row) : action.badgeVariant;
      const disabled = typeof action.disabled === 'function' ? action.disabled(row) : !!action.disabled;
      const hidden = action.hidden ? action.hidden(row) : false;

      return {
        id: String(index),
        label: action.label,
        icon: action.icon,
        description: action.description,
        variant: (action.variant as any) || 'default',
        badge,
        badgeVariant,
        disabled,
        hidden,
        divider: action.divider,
        data: row,
      };
    });
  }

  onDropdownItemClick(row: T, item: DropdownItem<T>): void {
    const index = item.id ? parseInt(item.id, 10) : -1;
    const action = index >= 0 && index < this.actions.length ? this.actions[index] : null;

    if (action) {
      if (action.onClick) {
        action.onClick(row);
      }
      this.actionClick.emit({ row, action, index });
    }
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
