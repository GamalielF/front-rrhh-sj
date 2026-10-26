import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ButtonComponent, CardComponent, FormComponent, InputComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { mensajeDeError } from '@core/utils';
import { CEDULA_DE_10_DIGITOS, COLUMNAS_PERFILES, MENSAJES_CEDULA, PerfilFila } from '../directorio.model';
import { DirectorioService } from '../directorio.service';
import { aFilasPerfiles } from '../directorio.util';

@Component({
  selector: 'app-buscador-cedula',
  standalone: true,
  imports: [ReactiveFormsModule, AvisoComponent, ButtonComponent, CardComponent, FormComponent, InputComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './buscador-cedula.component.html',
  styleUrls: ['./buscador-cedula.component.css'],
})
export class BuscadorCedulaComponent {
  private servicio = inject(DirectorioService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly columnas = COLUMNAS_PERFILES;
  readonly mensajesCedula = MENSAJES_CEDULA;
  readonly formulario = this.fb.nonNullable.group({
    cedula: ['', [Validators.required, Validators.pattern(CEDULA_DE_10_DIGITOS)]],
  });

  readonly resultados = signal<PerfilFila[]>([]);
  readonly buscando = signal(false);
  readonly buscado = signal(false);
  readonly error = signal('');

  buscar(): void {
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid || this.buscando()) {
      return;
    }
    this.error.set('');
    this.buscando.set(true);
    this.servicio
      .buscarPorCedula(this.formulario.getRawValue().cedula)
      .pipe(
        finalize(() => this.buscando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (perfiles) => {
          this.resultados.set(aFilasPerfiles(perfiles));
          this.buscado.set(true);
        },
        error: (error: unknown) => {
          this.resultados.set([]);
          this.buscado.set(false);
          this.error.set(mensajeDeError(error));
        },
      });
  }
}
