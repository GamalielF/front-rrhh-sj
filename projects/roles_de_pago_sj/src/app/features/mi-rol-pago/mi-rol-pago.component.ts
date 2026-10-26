import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '@lumen/auth';
import { ButtonComponent, CardComponent, FormComponent, InputComponent, PageContainerComponent } from '@lumen/ui';
import type { RolPagoPdfResponse } from '@models';
import { VisorPdfComponent } from '@components';
import { estadoHttp, formatearPeriodo, mensajeDeError } from '@core/utils';
import { CEDULA_DE_10_DIGITOS, MENSAJES_CEDULA, MENSAJES_CONSULTA, TIEMPO_BLOQUEO_MS } from './mi-rol-pago.model';
import { MiRolPagoService } from './mi-rol-pago.service';
import { cedulaCoincideConSesion, cedulaDeSesion, mascararCedula } from './mi-rol-pago.util';

@Component({
  selector: 'app-mi-rol-pago',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    CardComponent,
    FormComponent,
    InputComponent,
    ButtonComponent,
    VisorPdfComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mi-rol-pago.component.html',
  styleUrls: ['./mi-rol-pago.component.css'],
})
export class MiRolPagoComponent {
  private fb = inject(FormBuilder);
  private servicio = inject(MiRolPagoService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  readonly etiqueta = formatearPeriodo;
  readonly mensajesCedula = MENSAJES_CEDULA;

  readonly cedulaSesion = toSignal(this.authService.user$.pipe(map(cedulaDeSesion)), { initialValue: null });
  readonly pistaCedula = computed(() => {
    const cedula = this.cedulaSesion();
    return cedula ? `Debe ser la cédula de su cuenta: ${mascararCedula(cedula)}` : 'Escriba los 10 dígitos de su cédula';
  });

  readonly periodos = signal<string[]>([]);
  readonly periodoSeleccionado = signal<string | null>(null);
  readonly cargandoPeriodos = signal(true);
  readonly errorPeriodos = signal('');
  readonly consultando = signal(false);
  readonly bloqueado = signal(false);
  readonly error = signal('');
  readonly rol = signal<RolPagoPdfResponse | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, Validators.pattern(CEDULA_DE_10_DIGITOS)]],
  });

  constructor() {
    this.cargarPeriodos();
    effect(() => {
      this.formulario.controls.cedula.setValidators([
        Validators.required,
        Validators.pattern(CEDULA_DE_10_DIGITOS),
        cedulaCoincideConSesion(this.cedulaSesion()),
      ]);
      this.formulario.controls.cedula.updateValueAndValidity();
    });
  }

  seleccionar(periodo: string): void {
    this.periodoSeleccionado.set(periodo);
    this.rol.set(null);
    this.error.set('');
  }

  consultar(): void {
    this.formulario.markAllAsTouched();
    const periodo = this.periodoSeleccionado();
    if (this.formulario.invalid || !periodo || this.bloqueado()) {
      return;
    }
    this.error.set('');
    this.rol.set(null);
    this.consultando.set(true);
    this.servicio
      .consultar({ cedula: this.formulario.getRawValue().cedula, periodo })
      .pipe(
        finalize(() => this.consultando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (rol) => this.rol.set(rol),
        error: (error: unknown) => this.manejarError(error),
      });
  }

  private cargarPeriodos(): void {
    this.servicio
      .periodos()
      .pipe(
        finalize(() => this.cargandoPeriodos.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (periodos) => {
          this.periodos.set(periodos);
          this.periodoSeleccionado.set(periodos[0] ?? null);
        },
        error: (error: unknown) => this.errorPeriodos.set(mensajeDeError(error, MENSAJES_CONSULTA)),
      });
  }

  private manejarError(error: unknown): void {
    this.error.set(mensajeDeError(error, MENSAJES_CONSULTA));
    if (estadoHttp(error) === 429) {
      this.bloqueado.set(true);
      timer(TIEMPO_BLOQUEO_MS)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.bloqueado.set(false));
    }
  }
}
