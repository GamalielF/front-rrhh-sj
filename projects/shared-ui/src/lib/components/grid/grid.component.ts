import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  GridCols,
  GridColsNumber,
  GridGap,
  GridAlign,
  GridJustify,
  GridFlow,
} from './grid.model';
import {
  GRID_COLS_MAP,
  GRID_COLS_SM_MAP,
  GRID_COLS_MD_MAP,
  GRID_COLS_LG_MAP,
  GRID_COLS_XL_MAP,
  GRID_COLS_2XL_MAP,
  GRID_GAP_MAP,
  GRID_GAP_X_MAP,
  GRID_GAP_Y_MAP,
  GRID_ALIGN_MAP,
  GRID_JUSTIFY_MAP,
  GRID_FLOW_MAP,
} from './grid.variant';

@Component({
  selector: 'ui-grid',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
})
export class GridComponent {
  @Input() cols?: GridCols;
  @Input() colsSm?: GridColsNumber;
  @Input() colsMd?: GridColsNumber;
  @Input() colsLg?: GridColsNumber;
  @Input() colsXl?: GridColsNumber;
  @Input() cols2xl?: GridColsNumber;

  @Input() gap?: GridGap = 'md';
  @Input() gapX?: GridGap;
  @Input() gapY?: GridGap;

  @Input() alignItems?: GridAlign;
  @Input() justifyItems?: GridJustify;
  @Input() autoFlow?: GridFlow;

  @Input() minColWidth?: string;
  @Input() customClass = '';

  @HostBinding('style.--ui-grid-min-col')
  get minColStyle(): string | null {
    return this.minColWidth || null;
  }

  get containerClass(): string {
    const classes: string[] = ['grid w-full'];

    if (typeof this.cols === 'number') {
      classes.push(GRID_COLS_MAP[this.cols] || 'grid-cols-1');
    } else if (this.cols === 'auto-fit') {
      classes.push('ui-grid--auto-fit');
    } else if (this.cols === 'auto-fill') {
      classes.push('ui-grid--auto-fill');
    } else if (!this.cols) {
      classes.push('grid-cols-1');
    }

    if (this.colsSm) classes.push(GRID_COLS_SM_MAP[this.colsSm]);
    if (this.colsMd) classes.push(GRID_COLS_MD_MAP[this.colsMd]);
    if (this.colsLg) classes.push(GRID_COLS_LG_MAP[this.colsLg]);
    if (this.colsXl) classes.push(GRID_COLS_XL_MAP[this.colsXl]);
    if (this.cols2xl) classes.push(GRID_COLS_2XL_MAP[this.cols2xl]);

    if (this.gap && !this.gapX && !this.gapY) {
      classes.push(GRID_GAP_MAP[this.gap] || 'gap-4');
    }
    if (this.gapX) classes.push(GRID_GAP_X_MAP[this.gapX]);
    if (this.gapY) classes.push(GRID_GAP_Y_MAP[this.gapY]);

    if (this.alignItems) classes.push(GRID_ALIGN_MAP[this.alignItems]);
    if (this.justifyItems) classes.push(GRID_JUSTIFY_MAP[this.justifyItems]);
    if (this.autoFlow) classes.push(GRID_FLOW_MAP[this.autoFlow]);
    if (this.customClass) classes.push(this.customClass);

    return classes.filter(Boolean).join(' ');
  }
}
