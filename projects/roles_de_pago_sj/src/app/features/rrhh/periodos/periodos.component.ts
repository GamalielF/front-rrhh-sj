import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { PageContainerComponent } from '@lumen/ui';
import { ErrorCargaComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { RrhhService } from '../rrhh.service';
import { periodoActual, periodoMasReciente } from '../rrhh.util';

@Component({
  selector: 'app-periodos',
  standalone: true,
  imports: [PageContainerComponent, ErrorCargaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './periodos.component.html',
  styleUrls: ['./periodos.component.css'],
})
export class PeriodosComponent {
  private servicio = inject(RrhhService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly error = signal('');

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.error.set('');
    this.servicio
      .periodos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (periodos) =>
          this.router.navigate(['/rrhh/periodos', periodoMasReciente(periodos) ?? periodoActual(new Date())], {
            replaceUrl: true,
          }),
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }
}
