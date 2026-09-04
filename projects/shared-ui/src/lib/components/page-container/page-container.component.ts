import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BreadcrumbItem } from '../breadcrumb/breadcrumb.model';
import { PageHeaderComponent } from '../page-header/page-header.component';
import { BadgeVariant } from '../badge';

@Component({
  selector: 'ui-page-container',
  standalone: true,
  imports: [CommonModule, BreadcrumbComponent, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-container.component.html',
  styleUrls: ['./page-container.component.scss'],
})
export class PageContainerComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() icon = '';
  @Input() badgeText = '';
  @Input() badgeVariant: BadgeVariant = 'primary';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
  @Input() autoBreadcrumbs = true;
  @Input() showHome = false;
  @Input() homeRoute = '/';
}
