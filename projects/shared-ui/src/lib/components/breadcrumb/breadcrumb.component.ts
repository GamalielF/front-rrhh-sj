import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BreadcrumbItem } from './breadcrumb.model';
import { BreadcrumbService } from './breadcrumb.service';

@Component({
  selector: 'ui-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss'],
})
export class BreadcrumbComponent {
  private readonly breadcrumbService = inject(BreadcrumbService, { optional: true });

  @Input() items: BreadcrumbItem[] = [];
  @Input() auto = true;
  @Input() separatorIcon = '@tui.chevron-right';
  @Input() homeIcon = '@tui.house';
  @Input() showHome = false;
  @Input() homeRoute = '/';

  @Output() itemClick = new EventEmitter<BreadcrumbItem>();

  get effectiveItems(): BreadcrumbItem[] {
    if (this.items && this.items.length > 0) {
      return this.items;
    }
    if (this.auto && this.breadcrumbService) {
      return this.breadcrumbService.breadcrumbs();
    }
    return [];
  }

  onItemClick(item: BreadcrumbItem, event: MouseEvent): void {
    this.itemClick.emit(item);
  }
}
