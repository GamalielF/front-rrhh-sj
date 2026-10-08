import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  inject,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataTableColumn,
  DataTableFilterValue,
  ColumnFilterDefinition,
  FilterOperator,
  RangePreset,
} from '../data-table.model';
import { OPERATOR_LABELS } from '../data-table.variant';
import { DataTableColorPickerComponent } from '../data-table-color-picker';
import { IconComponent } from '../../icon/icon.component';

@Component({
  selector: 'ui-data-table-filter-popover',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableColorPickerComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table-filter-popover.component.html',
  styleUrls: ['./data-table-filter-popover.component.css'],
})
export class DataTableFilterPopoverComponent<T = any> implements OnChanges {
  private elementRef = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);

  @Input({ required: true }) column!: DataTableColumn<T>;
  @Input() activeFilters: DataTableFilterValue[] = [];

  @Output() filterAdd = new EventEmitter<DataTableFilterValue>();
  @Output() filterRemove = new EventEmitter<string>();
  @Output() filterUpdate = new EventEmitter<DataTableFilterValue>();

  isOpen = false;
  selectedDefIndex = 0;
  operator: FilterOperator = 'contains';
  value: any = '';
  valueEnd: any = '';
  selectedColor?: string;
  editingFilterId?: string;
  activeColorPickerFilterId?: string;

  selectedPresetIndex = -1;

  popoverTop = 0;
  popoverLeft = 0;

  readonly operatorLabels = OPERATOR_LABELS;

  get availableDefinitions(): ColumnFilterDefinition<T>[] {
    return this.column?.filters || [];
  }

  get currentDefinition(): ColumnFilterDefinition<T> | undefined {
    return this.availableDefinitions[this.selectedDefIndex];
  }

  get availableOperators(): FilterOperator[] {
    const def = this.currentDefinition;
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

  get canAddMore(): boolean {
    const def = this.currentDefinition;
    if (!def) return false;
    if (!def.allowMultiple) return false;
    return true; // always allow adding more when allowMultiple
  }

  get currentDefActiveCount(): number {
    const def = this.currentDefinition;
    if (!def) return 0;
    return this.columnActiveFilters.filter((f) => f.type === def.type).length;
  }

  get columnActiveFilters(): DataTableFilterValue[] {
    return this.activeFilters.filter((f) => f.columnKey === this.column.key);
  }

  get hasActiveFilter(): boolean {
    return this.columnActiveFilters.length > 0;
  }

  get isEditing(): boolean {
    return !!this.editingFilterId;
  }

  private nextInstanceIndex(def: ColumnFilterDefinition<T>): number {
    const existing = this.columnActiveFilters
      .filter((f) => f.type === def.type && f.instanceIndex !== undefined)
      .map((f) => f.instanceIndex as number);
    if (existing.length === 0) return 1;
    return Math.max(...existing) + 1;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['column'] || changes['activeFilters']) {
      this.syncDefaults();
    }
  }

  toggle(event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.updatePosition();
      this.syncDefaults();
    }
    this.cdr.markForCheck();
  }

  updatePosition(): void {
    if (typeof window === 'undefined' || !this.elementRef?.nativeElement) return;
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    this.popoverTop = rect.bottom + 6;
    const popoverWidth = 300;
    if (rect.left + popoverWidth > window.innerWidth - 16) {
      this.popoverLeft = Math.max(16, window.innerWidth - popoverWidth - 16);
    } else {
      this.popoverLeft = Math.max(16, rect.left);
    }
  }

  close(): void {
    this.isOpen = false;
    this.editingFilterId = undefined;
    this.activeColorPickerFilterId = undefined;
    this.cdr.markForCheck();
  }

  onDefChange(index: number): void {
    this.selectedDefIndex = index;
    this.editingFilterId = undefined;
    this.selectedPresetIndex = -1;
    const def = this.currentDefinition;
    if (def) {
      if (!def.allowMultiple) {
        const existing = this.columnActiveFilters.find((f) => f.type === def.type);
        if (existing) {
          this.loadFilterForEdit(existing);
          return;
        }
      }
      this.operator = def.defaultOperator || (def.operators?.[0]) || this.availableOperators[0] || 'equals';
      this.selectedColor = def.defaultColor;
      this.value = def.defaultValue ?? '';
      this.valueEnd = def.defaultValueEnd ?? '';
    }
  }

  loadFilterForEdit(f: DataTableFilterValue): void {
    this.editingFilterId = f.id;
    const defIdx = this.availableDefinitions.findIndex((d) => d.type === f.type);
    if (defIdx > -1) {
      this.selectedDefIndex = defIdx;
    }
    this.operator = f.operator;
    this.value = f.value;
    this.valueEnd = f.valueEnd;
    this.selectedColor = f.color;
    if (f.type === 'dropdown-range') {
      const def = this.availableDefinitions.find((d) => d.type === 'dropdown-range');
      this.selectedPresetIndex = def?.presetRanges?.findIndex(
        (p) => p.min === f.value && p.max === f.valueEnd
      ) ?? -1;
    } else {
      this.selectedPresetIndex = -1;
    }
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.editingFilterId = undefined;
    this.selectedPresetIndex = -1;
    this.syncDefaults();
  }

  onPresetIndexChange(index: number, presets: RangePreset[]): void {
    const preset = presets[index];
    if (preset) {
      this.selectPreset(preset);
      this.selectedPresetIndex = +index;
    } else {
      this.selectedPresetIndex = -1;
    }
  }

  selectPreset(preset: RangePreset): void {
    this.value = preset.min;
    this.valueEnd = preset.max;
    this.operator = 'between';
    this.cdr.markForCheck();
  }

  onColorChange(color?: string): void {
    this.selectedColor = color;
  }

  private resolveLabel(def: ColumnFilterDefinition): string {
    if (this.selectedPresetIndex >= 0) {
      const presets = def.presetRanges;
      if (presets?.[this.selectedPresetIndex]) return presets[this.selectedPresetIndex].label;
    }
    return def.label || `${this.column.title} (${this.operatorLabels[this.operator] || this.operator})`;
  }

  updateActiveFilterColor(f: DataTableFilterValue, newColor?: string): void {
    const updated: DataTableFilterValue = {
      ...f,
      color: newColor,
    };
    this.filterUpdate.emit(updated);
  }

  toggleQuickColorPicker(filterId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeColorPickerFilterId =
      this.activeColorPickerFilterId === filterId ? undefined : filterId;
    this.cdr.markForCheck();
  }

  applyFilter(): void {
    const def = this.currentDefinition;
    if (!def) return;

    if (def.type === 'sort') {
      this.value = this.operator;
    } else if (def.type === 'dropdown-range') {
      if (this.value === '' || this.value === null || this.value === undefined) return;
      this.operator = 'between';
    } else if (this.value === '' || this.value === null || this.value === undefined) {
      return;
    }

    const resolvedLabel = this.resolveLabel(def);

    // If explicitly editing an existing filter by ID, update it
    if (this.editingFilterId) {
      const existing = this.activeFilters.find((f) => f.id === this.editingFilterId);
      if (existing) {
        const updatedFilter: DataTableFilterValue = {
          ...existing,
          operator: this.operator,
          value: this.value,
          valueEnd: this.valueEnd,
          color: this.selectedColor,
          label: resolvedLabel,
        };
        this.filterUpdate.emit(updatedFilter);
        this.editingFilterId = undefined;
        this.value = '';
        this.valueEnd = '';
        this.close();
        return;
      }
    }

    // allowMultiple: always create a new instance
    if (def.allowMultiple) {
      const instanceIndex = this.nextInstanceIndex(def);
      const baseName = def.paramName || this.column.key;
      const newFilter: DataTableFilterValue = {
        id: `${this.column.key}_${def.type}_${Date.now()}`,
        columnKey: this.column.key,
        columnTitle: this.column.title,
        type: def.type,
        operator: this.operator,
        value: this.value,
        valueEnd: this.valueEnd,
        paramName: baseName,
        paramNameEnd: def.paramNameEnd,
        color: this.selectedColor,
        enabled: true,
        locked: def.locked,
        instanceIndex,
        label: resolvedLabel,
      };
      this.filterAdd.emit(newFilter);
      this.editingFilterId = undefined;
      this.value = '';
      this.valueEnd = '';
      this.close();
      return;
    }

    // Single-instance: update if same type already exists, otherwise create
    const existing = this.activeFilters.find(
      (f) => f.columnKey === this.column.key && f.type === def.type
    );

    if (existing) {
      const updatedFilter: DataTableFilterValue = {
        ...existing,
        operator: this.operator,
        value: this.value,
        valueEnd: this.valueEnd,
        color: this.selectedColor,
        label: resolvedLabel,
      };
      this.filterUpdate.emit(updatedFilter);
    } else {
      const newFilter: DataTableFilterValue = {
        id: `${this.column.key}_${def.type}_${Date.now()}`,
        columnKey: this.column.key,
        columnTitle: this.column.title,
        type: def.type,
        operator: this.operator,
        value: this.value,
        valueEnd: this.valueEnd,
        paramName: def.paramName || this.column.key,
        paramNameEnd: def.paramNameEnd,
        color: this.selectedColor,
        enabled: true,
        locked: def.locked,
        instanceIndex: 1,
        label: resolvedLabel,
      };
      this.filterAdd.emit(newFilter);
    }

    this.editingFilterId = undefined;
    this.value = '';
    this.valueEnd = '';
    this.close();
  }

  removeFilter(id: string, event?: MouseEvent): void {
    if (event) {
      event.stopPropagation();
    }
    this.filterRemove.emit(id);
    if (this.editingFilterId === id) {
      this.cancelEdit();
    }
  }

  private syncDefaults(): void {
    const def = this.currentDefinition;
    if (def) {
      if (!def.allowMultiple) {
        const existing = this.columnActiveFilters.find((f) => f.type === def.type);
        if (existing) {
          this.loadFilterForEdit(existing);
          return;
        }
      }
      this.editingFilterId = undefined;
      this.selectedPresetIndex = -1;
      this.operator = def.defaultOperator || (def.operators?.[0]) || this.availableOperators[0] || 'equals';
      this.selectedColor = def.defaultColor;
      this.value = def.defaultValue ?? '';
      this.valueEnd = def.defaultValueEnd ?? '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) return;
    const clickedInsideTrigger = this.elementRef.nativeElement.contains(event.target);
    const popoverEl = document.getElementById(`filter-popover-${this.column.key}`);
    const clickedInsidePopover = popoverEl && popoverEl.contains(event.target as Node);

    if (!clickedInsideTrigger && !clickedInsidePopover) {
      this.close();
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    if (this.isOpen) {
      this.updatePosition();
      this.cdr.markForCheck();
    }
  }
}
