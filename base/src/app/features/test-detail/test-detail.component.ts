import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  PageContainerComponent,
  ButtonComponent,
  CardComponent,
  IconComponent,
  LinkComponent,
} from '@lumen/ui';

@Component({
  selector: 'app-test-detail',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    ButtonComponent,
    CardComponent,
    LinkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './test-detail.component.html',
  styleUrls: ['./test-detail.component.css'],
})
export class TestDetailComponent {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/test']);
  }
}
