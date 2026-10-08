import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataTableColumn,
  DataTableFilterValue,
  FilterOperator,
  ColumnFilterDefinition,
  RangePreset,
} from '../data-table.model';
import { OPERATOR_LABELS, FILTER_CHIP_BASE } from '../data-table.variant';
import { DataTableColorPickerComponent } from '../data-table-color-picker';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'ui-data-table-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableColorPickerComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table-filter-bar.component.html',
  styleUrls: ['./data-table-filter-bar.component.css'],
})
export class DataTableFilterBarComponent<T = any> {
  private cdr = inject(ChangeDetectorRef);
  private elementRef = inject(ElementRef);

  @Input() filters: DataTableFilterValue[] = [];
  @Input() columns: DataTableColumn<T>[] = [];

  @Output() removeFilter = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();
  @Output() toggleFilter = new EventEmitter<string>();
  @Output() filterUpdate = new EventEmitter<DataTableFilterValue>();

  readonly chipBaseClass = FILTER_CHIP_BASE;
  readonly operatorLabels = OPERATOR_LABELS;

  editingFilter: DataTableFilterValue | null = null;
  editOperator: FilterOperator = 'contains';
  editValue: any = '';
  editValueEnd: any = '';
  editColor?: string;
  editPresetIndex = -1;
  quickColorFilterId?: string;

  popoverTop = 0;
  popoverLeft = 0;

  get hasFilters(): boolean {
    return this.filters.length > 0;
  }

  get currentEditingColumn(): DataTableColumn<T> | undefined {
    if (!this.editingFilter) return undefined;
    return this.columns.find((c) => c.key === this.editingFilter?.columnKey);
  }

  get currentEditingDefinition(): ColumnFilterDefinition<T> | undefined {
    const col = this.currentEditingColumn;
    if (!col || !this.editingFilter) return undefined;
    return col.filters?.find((f) => f.type === this.editingFilter?.type);
  }

  get availableOperators(): FilterOperator[] {
    const def = this.currentEditingDefinition;
    if (!def) return [];
    if (def.operators && def.operators.length > 0) {
      return def.operators;
    }
    switch (def.type) {
      case 'text':
        return ['contains', 'equals', 'startsWith', 'endsWith'];
      case 'number':
        return ['equals', 'gt', 'gte', 'lt', 'lte'];
      case 'number-range':
      case 'date-range':
      case 'dropdown-range':
        return ['between'];
      case 'date':
        return ['equals', 'before', 'after'];
      case 'select':
        return ['equals', 'in'];
      case 'sort':
        return ['asc', 'desc', 'none'];
      default:
        return ['equals'];
    }
  }

  openEditPopover(f: DataTableFilterValue, event: MouseEvent): void {
    event.stopPropagation();
    this.editingFilter = f;
    this.editOperator = f.operator;
    this.editValue = f.value;
    this.editValueEnd = f.valueEnd;
    this.editColor = f.color;
    this.quickColorFilterId = undefined;

    // Init preset state for dropdown-range
    if (f.type === 'dropdown-range') {
      const def = this.columns
        .find((c) => c.key === f.columnKey)
        ?.filters?.find((d) => d.type === 'dropdown-range');
      const idx = def?.presetRanges?.findIndex(
        (p) => p.min === f.value && p.max === f.valueEnd
      ) ?? -1;
      this.editPresetIndex = idx;
    } else {
      this.editPresetIndex = -1;
    }

    const target = event.currentTarget as HTMLElement;
    if (target && typeof window !== 'undefined') {
      const rect = target.getBoundingClientRect();
      this.popoverTop = rect.bottom + 6;
      const popoverWidth = 300;
      if (rect.left + popoverWidth > window.innerWidth - 16) {
        this.popoverLeft = Math.max(16, window.innerWidth - popoverWidth - 16);
      } else {
        this.popoverLeft = Math.max(16, rect.left);
      }
    }
    this.cdr.markForCheck();
  }

  openColorPopover(f: DataTableFilterValue, event: MouseEvent): void {
    event.stopPropagation();
    if (this.quickColorFilterId === f.id) {
      this.quickColorFilterId = undefined;
    } else {
      this.quickColorFilterId = f.id;
      this.editingFilter = null;
      const target = event.currentTarget as HTMLElement;
      if (target && typeof window !== 'undefined') {
        const rect = target.getBoundingClientRect();
        this.popoverTop = rect.bottom + 6;
        const popoverWidth = 260;
        if (rect.left + popoverWidth > window.innerWidth - 16) {
          this.popoverLeft = Math.max(16, window.innerWidth - popoverWidth - 16);
        } else {
          this.popoverLeft = Math.max(16, rect.left);
        }
      }
    }
    this.cdr.markForCheck();
  }

  closePopovers(): void {
    this.editingFilter = null;
    this.quickColorFilterId = null as any;
    this.cdr.markForCheck();
  }

  saveEdit(): void {
    if (!this.editingFilter) return;
    const def = this.currentEditingDefinition;

    let resolvedLabel: string;
    if (this.editingFilter.type === 'dropdown-range' && this.editPresetIndex >= 0) {
      resolvedLabel = def?.presetRanges?.[this.editPresetIndex]?.label
        ?? def?.label
        ?? this.editingFilter.columnTitle;
    } else {
      resolvedLabel = def?.label
        ?? `${this.editingFilter.columnTitle} (${this.operatorLabels[this.editOperator] || this.editOperator})`;
    }

    const updated: DataTableFilterValue = {
      ...this.editingFilter,
      operator: this.editOperator,
      value: this.editingFilter.type === 'sort' ? this.editOperator : this.editValue,
      valueEnd: this.editValueEnd,
      color: this.editColor,
      label: resolvedLabel,
    };

    this.filterUpdate.emit(updated);
    this.closePopovers();
  }

  onEditPresetIndexChange(index: number): void {
    const presets = this.currentEditingDefinition?.presetRanges;
    const preset: RangePreset | undefined = presets?.[+index];
    if (preset) {
      this.editPresetIndex = +index;
      this.editValue = preset.min;
      this.editValueEnd = preset.max;
      this.editOperator = 'between';
    } else {
      this.editPresetIndex = -1;
    }
    this.cdr.markForCheck();
  }

  updateColor(f: DataTableFilterValue, newColor?: string): void {
    const updated: DataTableFilterValue = {
      ...f,
      color: newColor,
    };
    this.filterUpdate.emit(updated);
  }

  onRemove(id: string, event: MouseEvent): void {
    event.stopPropagation();
    this.removeFilter.emit(id);
    if (this.editingFilter?.id === id || this.quickColorFilterId === id) {
      this.closePopovers();
    }
  }

  onClearAll(): void {
    this.closePopovers();
    this.clearAll.emit();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.editingFilter && !this.quickColorFilterId) return;
    const editPopoverEl = document.getElementById('filter-bar-edit-popover');
    const colorPopoverEl = document.getElementById('filter-bar-color-popover');
    const clickedInsideEdit = editPopoverEl && editPopoverEl.contains(event.target as Node);
    const clickedInsideColor = colorPopoverEl && colorPopoverEl.contains(event.target as Node);

    if (!clickedInsideEdit && !clickedInsideColor) {
      this.closePopovers();
    }
  }
}
