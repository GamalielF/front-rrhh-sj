import { Component, OnInit, inject, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Credit } from '@models';
import { AuthService, CreditService } from '@services';
import { NotifyModalComponent } from '@components/notify-modal';

import {
  DashboardLayoutComponent,
  NavItem,
  PageHeaderComponent,
  TableComponent,
  TableColumn,
  TableAction,
  PaginationComponent,
  ButtonComponent,
  InputComponent,
  IconComponent,
  BadgeComponent,
} from 'shared-ui';

@Component({
  selector: 'app-credits-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NotifyModalComponent,
    // shared-ui
    DashboardLayoutComponent,
    PageHeaderComponent,
    TableComponent,
    PaginationComponent,
    ButtonComponent,
    InputComponent,
    IconComponent,
  ],
  templateUrl: './credits-list.component.html',
  styleUrls: ['./credits-list.component.scss'],
})
export class CreditsListComponent implements OnInit {
  private creditService = inject(CreditService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  credits: Credit[] = [];
  pageNumber = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  isLoading = false;
  selectedCredit: Credit | null = null;
  selectedCredits: Credit[] = [];
  showNotifyModal = false;

  readonly navItems: NavItem[] = [
    { label: 'Créditos en Mora', icon: '@tui.bell', route: '/credits', active: true },
  ];

  tableColumns: TableColumn<Credit>[] = [
    { key: 'creditCode', title: 'Código', type: 'text', prefix: '#' },
    { key: 'fullName', title: 'Cliente / Socio', type: 'text' },
    { key: 'officeName', title: 'Oficina', type: 'text' },
    { key: 'cellphone', title: 'Celular', type: 'text' },
    {
      key: 'daysPastDue',
      title: 'Días Mora',
      type: 'badge',
      suffix: ' días',
      badgeVariant: (row: Credit) => {
        const d = row.daysPastDue ?? 0;
        if (d >= 90) return 'danger';
        if (d >= 30) return 'warning';
        return 'info';
      }
    },
  ];

  tableActions: TableAction<Credit>[] = [
    { label: 'Notificar', icon: '@tui.send', variant: 'primary' },
  ];

  daysPastDueControl = new FormControl(1);

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadCredits();
    this.daysPastDueControl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(() => {
      this.pageNumber = 0;
      this.selectedCredits = [];
      this.loadCredits();
    });
  }

  loadCredits(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    const daysPastDue = this.daysPastDueControl.value ?? 1;
    const token = this.authService.getToken() ?? '';

    this.creditService.getCredits(token, this.pageNumber, this.pageSize, daysPastDue).subscribe({
      next: (res: any) => {
        try {
          if (Array.isArray(res)) {
            this.credits = res;
            this.totalPages = 1;
            this.totalElements = res.length;
            this.pageNumber = 0;
          } else {
            this.credits = res?.content || [];
            this.totalPages = res?.totalPages || 0;
            this.totalElements = res?.totalElements || 0;
            this.pageNumber = res?.number || 0;
          }
        } catch (e) {
          console.error('Error al procesar créditos:', e);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando créditos:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
        if (err.status === 401 || err.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  onPageChange(page: number): void {
    this.pageNumber = page;
    this.selectedCredits = [];
    this.loadCredits();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNumber = 0;
    this.selectedCredits = [];
    this.loadCredits();
  }

  onSelectionChange(selected: Credit[]): void {
    this.selectedCredits = selected;
  }

  onActionClick(event: { row: Credit }): void {
    this.selectedCredit = event.row;
    this.selectedCredits = [event.row];
    this.showNotifyModal = true;
  }

  onNotifySelected(): void {
    if (this.selectedCredits.length === 0) return;
    this.selectedCredit = this.selectedCredits[0];
    this.showNotifyModal = true;
  }

  onModalClose(): void {
    this.showNotifyModal = false;
    this.selectedCredit = null;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
