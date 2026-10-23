import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  PageContainerComponent,
  ButtonComponent,
  CardComponent,
  LinkComponent,
} from '@lumen/ui';

@Component({
  selector: 'app-test-subdetail',
  standalone: true,
  imports: [
    CommonModule,
    PageContainerComponent,
    ButtonComponent,
    CardComponent,
    LinkComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './test-subdetail.component.html',
  styleUrls: ['./test-subdetail.component.css'],
})
export class TestSubdetailComponent {
  private router = inject(Router);

  goBack(): void {
    this.router.navigate(['/test/detalle']);
  }
}
