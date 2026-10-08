import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PRESET_COLORS } from '../data-table.variant';

@Component({
  selector: 'ui-data-table-color-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './data-table-color-picker.component.html',
  styleUrls: ['./data-table-color-picker.component.css'],
})
export class DataTableColorPickerComponent {
  @Input() selectedColor?: string;
  @Input() allowNone = true;
  @Output() colorChange = new EventEmitter<string | undefined>();

  readonly presets = PRESET_COLORS;
  customHex = '';

  selectPreset(hex: string): void {
    this.selectedColor = hex;
    this.customHex = hex;
    this.colorChange.emit(hex);
  }

  clearColor(): void {
    this.selectedColor = undefined;
    this.customHex = '';
    this.colorChange.emit(undefined);
  }

  onCustomHexChange(hex: string): void {
    if (hex && !hex.startsWith('#')) {
      hex = `#${hex}`;
    }
    this.selectedColor = hex;
    this.colorChange.emit(hex);
  }
}
