import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import type { GridSpan, GridSpanNumber } from './grid-item.model';
import type { GridGap, GridAlign } from '../grid.model';
import { GRID_GAP_MAP } from '../grid.variant';
import {
  ITEM_SPAN_MAP,
  ITEM_SPAN_SM_MAP,
  ITEM_SPAN_MD_MAP,
  ITEM_SPAN_LG_MAP,
  ITEM_SPAN_XL_MAP,
  ITEM_SPAN_2XL_MAP,
  ITEM_ROW_SPAN_MAP,
} from './grid-item.variant';

@Component({
  selector: 'ui-grid-item, ui-grid-col',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './grid-item.component.html',
  styleUrls: ['./grid-item.component.css'],
})
export class GridItemComponent {
  @Input() colSpan?: GridSpan;
  @Input() colSpanSm?: GridSpanNumber;
  @Input() colSpanMd?: GridSpanNumber;
  @Input() colSpanLg?: GridSpanNumber;
  @Input() colSpanXl?: GridSpanNumber;
  @Input() colSpan2xl?: GridSpanNumber;

  @Input() rowSpan?: GridSpanNumber;
  @Input() rowSpanSm?: GridSpanNumber;
  @Input() rowSpanMd?: GridSpanNumber;
  @Input() rowSpanLg?: GridSpanNumber;

  @Input() alignSelf?: 'auto' | GridAlign;
  @Input() justifySelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';

  @Input() flex = false;
  @Input() flexDirection: 'col' | 'row' = 'col';
  @Input() gap?: GridGap;

  @Input() customClass = '';

  get itemClass(): string {
    const classes: string[] = ['w-full min-w-0'];

    if (typeof this.colSpan === 'number') {
      classes.push(ITEM_SPAN_MAP[this.colSpan]);
    } else if (this.colSpan === 'full') {
      classes.push('col-span-full');
    }

    if (this.colSpanSm) classes.push(ITEM_SPAN_SM_MAP[this.colSpanSm]);
    if (this.colSpanMd) classes.push(ITEM_SPAN_MD_MAP[this.colSpanMd]);
    if (this.colSpanLg) classes.push(ITEM_SPAN_LG_MAP[this.colSpanLg]);
    if (this.colSpanXl) classes.push(ITEM_SPAN_XL_MAP[this.colSpanXl]);
    if (this.colSpan2xl) classes.push(ITEM_SPAN_2XL_MAP[this.colSpan2xl]);

    if (this.rowSpan) classes.push(ITEM_ROW_SPAN_MAP[this.rowSpan]);
    if (this.rowSpanSm) classes.push(`sm:${ITEM_ROW_SPAN_MAP[this.rowSpanSm]}`);
    if (this.rowSpanMd) classes.push(`md:${ITEM_ROW_SPAN_MAP[this.rowSpanMd]}`);
    if (this.rowSpanLg) classes.push(`lg:${ITEM_ROW_SPAN_MAP[this.rowSpanLg]}`);

    if (this.alignSelf && this.alignSelf !== 'auto') {
      classes.push(`self-${this.alignSelf}`);
    }
    if (this.justifySelf && this.justifySelf !== 'auto') {
      classes.push(`justify-self-${this.justifySelf}`);
    }

    if (this.flex) {
      classes.push('flex');
      classes.push(this.flexDirection === 'row' ? 'flex-row' : 'flex-col');
      if (this.gap) {
        classes.push(GRID_GAP_MAP[this.gap] || 'gap-4');
      }
    }

    if (this.customClass) {
      classes.push(this.customClass);
    }

    return classes.filter(Boolean).join(' ');
  }
}
