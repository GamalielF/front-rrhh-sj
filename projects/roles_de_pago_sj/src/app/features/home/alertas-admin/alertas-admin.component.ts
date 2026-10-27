import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ButtonComponent, CardComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { AlertaAdmin } from '../home.model';
import { AlertasAdminService } from './alertas-admin.service';

@Component({
  selector: 'app-alertas-admin',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent, CardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './alertas-admin.component.html',
  styleUrls: ['./alertas-admin.component.css'],
})
export class AlertasAdminComponent {
  private servicio = inject(AlertasAdminService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly alertas = signal<AlertaAdmin[]>([]);
  readonly incompleto = signal(false);
  readonly cargando = signal(true);
  readonly error = signal('');

  constructor() {
    this.servicio
      .cargar(new Date())
      .pipe(
        finalize(() => this.cargando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (resultado) => {
          this.alertas.set(resultado.alertas);
          this.incompleto.set(resultado.incompleto);
        },
        error: (error: unknown) => this.error.set(mensajeDeError(error)),
      });
  }

  abrir(ruta: string): void {
    this.router.navigateByUrl(ruta);
  }
}
