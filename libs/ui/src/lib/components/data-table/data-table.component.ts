import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  ChangeDetectionStrategy,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  DataTableColumn,
  DataTableFilterValue,
  DataTableState,
  HighlightMode,
  SpringPageResponse,
} from './data-table.model';
import { TableAction, TableActionsLayout } from '../table/table.model';
import { DropdownItem, DropdownTriggerVariant } from '../dropdown/dropdown.model';
import { BadgeComponent } from '../badge/badge.component';
import { IconComponent } from '../icon/icon.component';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { AvatarIconComponent } from '../avatar-icon/avatar-icon.component';
import { DataTableFilterBarComponent } from './data-table-filter-bar';
import { DataTableFilterPopoverComponent } from './data-table-filter-popover';
import { ACTION_BASE, ACTION_VARIANT } from './data-table.variant';

@Component({
  selector: 'ui-data-table',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    BadgeComponent,
    IconComponent,
    DropdownComponent,
    PaginationComponent,
    DataTableFilterBarComponent,
    DataTableFilterPopoverComponent,
    AvatarIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.css'],
})
export class DataTableComponent<T extends Record<string, any> = Record<string, any>>
  implements OnInit, OnChanges
{
  @Input() columns: DataTableColumn<T>[] = [];
  @Input() data: SpringPageResponse<T> | null = {content: [], totalPages: 0, totalElements: 0, size: 0, number: 0};
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

  @Input() page = 0;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() showPagination = true;
  @Input() showFilterBar = true;
  @Input() highlightMode: HighlightMode = 'auto';
  @Input() defaultQueryParams: Record<string, any> = {};
  @Input() emitInitialState = true;

  @Output() selectionChange = new EventEmitter<T[]>();
  @Output() actionClick = new EventEmitter<{ row: T; action: TableAction<T>; index: number }>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() stateChange = new EventEmitter<DataTableState>();
  @Output() filterChange = new EventEmitter<{ filters: DataTableFilterValue[]; queryParams: Record<string, any> }>();

  activeFilters: DataTableFilterValue[] = [];
  readonly skeletonWidths = ['w-16', 'w-24', 'w-32', 'w-40', 'w-28'];

  ngOnInit(): void {
    if (this.emitInitialState) {
      this.emitState();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // No-op
  }

  private getDefaultFilterParams(): Record<string, any> {
    const defaults: Record<string, any> = {};
    for (const col of this.columns) {
      if (!col.filters) continue;
      for (const def of col.filters) {
        if (def.type === 'number-range' || def.type === 'date-range') {
          const paramName = def.paramName || col.key;
          if (def.defaultValue !== undefined && def.defaultValue !== '' && def.defaultValue !== null) {
            defaults[paramName] = def.defaultValue;
          }
          if (
            def.defaultValueEnd !== undefined &&
            def.defaultValueEnd !== '' &&
            def.defaultValueEnd !== null &&
            def.paramNameEnd
          ) {
            defaults[def.paramNameEnd] = def.defaultValueEnd;
          }
        } else {
          if (def.defaultValue !== undefined && def.defaultValue !== '' && def.defaultValue !== null) {
            const paramName = def.paramName || col.key;
            defaults[paramName] = def.defaultValue;
          }
        }
      }
    }
    return defaults;
  }

  get tableData(): T[] {
    if (!this.data) return [];
    if (Array.isArray(this.data)) {
      return this.data;
    }
    if (Array.isArray((this.data as any).content)) {
      return (this.data as any).content;
    }
    return [];
  }

  get computedTotal(): number {
    if (this.data?.totalPage !== undefined) return this.data.totalPage;
    if (this.data?.totalElements !== undefined) return this.data.totalElements;
    if (this.total !== undefined && this.total > 0) return this.total;
    return this.tableData.length;
  }

  get computedPage(): number {
    if (this.data?.pageNumber !== undefined) return this.data.pageNumber;
    if (this.data?.number !== undefined) return this.data.number;
    if (this.page !== undefined && this.page > 0) return this.page;
    return 0;
  }

  get computedPageSize(): number {
    if (this.data?.pageSize !== undefined) return this.data.pageSize;
    if (this.data?.size !== undefined) return this.data.size;
    if (this.pageSize !== undefined && this.pageSize > 0) return this.pageSize;
    return 10;
  }

  get skeletonRows(): number[] {
    return Array.from({ length: this.skeletonCount }, (_, i) => i);
  }

  get isAllSelected(): boolean {
    return this.tableData.length > 0 && this.selectedRows.length === this.tableData.length;
  }

  get isSomeSelected(): boolean {
    return this.selectedRows.length > 0 && !this.isAllSelected;
  }

  get useDropdownLayout(): boolean {
    if (this.actionsLayout === 'buttons') return false;
    if (this.actionsLayout === 'dropdown') return true;
    return this.actions.length > 1;
  }

  get activeColoredFilters(): DataTableFilterValue[] {
    return this.activeFilters.filter((f) => f.enabled && f.color);
  }

  get distinctFilterColumns(): string[] {
    const keys = new Set(this.activeColoredFilters.map((f) => f.columnKey));
    return Array.from(keys);
  }

  get isSingleColumnFilterActive(): boolean {
    return this.distinctFilterColumns.length === 1;
  }

  toggleAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selectionChange.emit(checked ? [...this.tableData] : []);
  }

  toggleRow(row: T): void {
    const idx = this.findIndex(row);
    const updated =
      idx > -1
        ? this.selectedRows.filter((_, i) => i !== idx)
        : [...this.selectedRows, row];
    this.selectionChange.emit(updated);
  }

  isSelected(row: T): boolean {
    return this.findIndex(row) > -1;
  }

  getValue(row: T, col: DataTableColumn<T>): any {
    return col.customRowValue ? col.customRowValue(row) : row[col.key];
  }

  isPrimaryColumn(col: DataTableColumn<T>): boolean {
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

  onPageChange(page: number): void {
    this.page = page;
    this.pageChange.emit(page);
    this.emitState();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.page = 0;
    this.pageSizeChange.emit(size);
    this.emitState();
  }

  onFilterAdd(filter: DataTableFilterValue): void {
    const existingIndex = this.activeFilters.findIndex((f) => f.id === filter.id);
    if (existingIndex > -1) {
      this.activeFilters = this.activeFilters.map((f, i) => (i === existingIndex ? filter : f));
    } else {
      this.activeFilters = [...this.activeFilters, filter];
    }
    this.onFiltersUpdated();
  }

  onFilterUpdate(updatedFilter: DataTableFilterValue): void {
    this.activeFilters = this.activeFilters.map((f) =>
      f.id === updatedFilter.id ? updatedFilter : f
    );
    this.onFiltersUpdated();
  }

  onFilterRemove(id: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f.id !== id);
    this.onFiltersUpdated();
  }

  onClearAllFilters(): void {
    this.activeFilters = this.activeFilters.filter((f) => f.locked);
    this.onFiltersUpdated();
  }

  private onFiltersUpdated(): void {
    this.page = 0;
    const queryParams = this.computeQueryParams();
    this.filterChange.emit({ filters: this.activeFilters, queryParams });
    this.emitState();
  }

  computeQueryParams(): Record<string, any> {
    const params: Record<string, any> = {
      ...this.getDefaultFilterParams(),
      ...(this.defaultQueryParams || {}),
    };
    for (const f of this.activeFilters) {
      if (!f.enabled) continue;

      // Resolve effective param names (suffixed when instanceIndex >= 2)
      const suffix = f.instanceIndex && f.instanceIndex >= 2 ? String(f.instanceIndex) : '';
      const effectiveParam = f.paramName + suffix;
      const effectiveParamEnd = f.paramNameEnd ? f.paramNameEnd + suffix : undefined;

      if (f.type === 'sort') {
        if (f.operator !== 'none') {
          params[effectiveParam] = `${f.columnKey},${f.operator}`;
        }
      } else if (f.type === 'number-range' || f.type === 'date-range') {
        if (f.value !== '' && f.value !== null && f.value !== undefined) {
          params[effectiveParam] = f.value;
        }
        if (effectiveParamEnd && f.valueEnd !== '' && f.valueEnd !== null && f.valueEnd !== undefined) {
          params[effectiveParamEnd] = f.valueEnd;
        }
      } else {
        if (f.value !== '' && f.value !== null && f.value !== undefined) {
          params[effectiveParam] = f.value;
        }
      }
    }
    return params;
  }

  private emitState(): void {
    const filterParams = this.computeQueryParams();
    this.stateChange.emit({
      page: this.page,
      pageSize: this.pageSize,
      filters: this.activeFilters,
      queryParams: {
        page: this.page,
        size: this.pageSize,
        ...filterParams,
      },
    });
  }

  getRowHighlightColor(row: T): string | null {
    if (this.highlightMode === 'none' || this.highlightMode === 'cell') return null;
    if (this.highlightMode === 'auto' && !this.isSingleColumnFilterActive) return null;

    // use the latest one
    let matchedColor: string | null = null;
    for (const f of this.activeColoredFilters) {
      if (f.color && this.checkRowMatch(row, f)) {
        matchedColor = f.color;
      }
    }
    return matchedColor;
  }

  getCellHighlightColor(row: T, col: DataTableColumn<T>): string | null {
    if (this.highlightMode === 'none' || this.highlightMode === 'row') return null;
    if (this.highlightMode === 'auto' && this.isSingleColumnFilterActive) return null;

    const colFilters = this.activeColoredFilters.filter((f) => f.columnKey === col.key);
    for (const f of colFilters) {
      if (f.color && this.checkRowMatch(row, f)) {
        return f.color;
      }
    }
    return null;
  }

  private checkRowMatch(row: T, filter: DataTableFilterValue): boolean {
    const colDef = this.columns.find((c) => c.key === filter.columnKey);
    const filterDef = colDef?.filters?.find((fd) => fd.type === filter.type);

    const cellVal = row[filter.columnKey];
    if (filterDef?.highlightPredicate) {
      return filterDef.highlightPredicate(cellVal, filter, row);
    }

    if (filter.type === 'sort') return false;

    const filterVal = filter.value;
    const filterValEnd = filter.valueEnd;

    switch (filter.operator) {
      case 'contains':
        return String(cellVal ?? '').toLowerCase().includes(String(filterVal ?? '').toLowerCase());
      case 'equals':
        return String(cellVal ?? '').toLowerCase() === String(filterVal ?? '').toLowerCase();
      case 'startsWith':
        return String(cellVal ?? '').toLowerCase().startsWith(String(filterVal ?? '').toLowerCase());
      case 'endsWith':
        return String(cellVal ?? '').toLowerCase().endsWith(String(filterVal ?? '').toLowerCase());
      case 'gt':
        return Number(cellVal) > Number(filterVal);
      case 'gte':
        return Number(cellVal) >= Number(filterVal);
      case 'lt':
        return Number(cellVal) < Number(filterVal);
      case 'lte':
        return Number(cellVal) <= Number(filterVal);
      case 'between':
        return Number(cellVal) >= Number(filterVal) && Number(cellVal) <= Number(filterValEnd);
      default:
        return false;
    }
  }

  private findIndex(row: T): number {
    if (this.trackByKey) {
      return this.selectedRows.findIndex((r) => r[this.trackByKey] === row[this.trackByKey]);
    }
    return this.selectedRows.indexOf(row);
  }
}
