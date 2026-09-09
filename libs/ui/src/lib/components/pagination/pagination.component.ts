import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  OnChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';

const NAV_BTN_BASE = [
  'inline-flex items-center justify-center w-9 h-9 rounded-lg',
  'border border-gray-200 bg-white text-gray-600',
  'hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300',
  'active:bg-gray-100',
  'outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-1',
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
  'transition-all duration-150 cursor-pointer',
].join(' ');

@Component({
  selector: 'ui-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css'],
})
export class PaginationComponent implements OnChanges {
  private static idCounter = 0;
  readonly sizeSelectId = `ui-page-size-${++PaginationComponent.idCounter}`;

  readonly navBtnClass = NAV_BTN_BASE;

  @Input() page = 0;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100, 200];
  @Input() disabled = false;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages = 0;
  rangeStart = 0;
  rangeEnd = 0;

  ngOnChanges(): void {
    this.totalPages = this.total > 0 ? Math.ceil(this.total / this.pageSize) : 0;
    this.rangeStart = this.total === 0 ? 0 : this.page * this.pageSize + 1;
    this.rangeEnd = Math.min(this.rangeStart + this.pageSize - 1, this.total);
  }

  goFirst(): void { this.pageChange.emit(0); }
  goPrev(): void { if (this.page > 0) this.pageChange.emit(this.page - 1); }
  goNext(): void { if (this.page < this.totalPages - 1) this.pageChange.emit(this.page + 1); }
  goLast(): void { if (this.totalPages > 0) this.pageChange.emit(this.totalPages - 1); }

  onSizeChange(size: number): void {
    this.pageSizeChange.emit(Number(size));
  }
}
