import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonComponent, DropdownComponent, DropdownItem, InputComponent, ModalComponent } from '@lumen/ui';
import { formatearPeriodo } from '@core/utils';
import { MENSAJES_PERIODO, PATRON_PERIODO, PeriodoFila } from '../../rrhh.model';
import { opcionesDePeriodos, periodoEnRango, sugerirPeriodoNuevo } from '../../rrhh.util';

@Component({
  selector: 'app-selector-periodo',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, DropdownComponent, InputComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selector-periodo.component.html',
  styleUrls: ['./selector-periodo.component.css'],
})
export class SelectorPeriodoComponent {
  readonly periodos = input<PeriodoFila[]>([]);
  readonly seleccionado = input.required<string>();
  readonly seleccionar = output<string>();

  readonly mensajesPeriodo = MENSAJES_PERIODO;
  readonly creando = signal(false);
  readonly periodoNuevo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(PATRON_PERIODO), periodoEnRango(() => new Date())],
  });

  readonly etiqueta = computed(() => formatearPeriodo(this.seleccionado()));
  readonly opciones = computed(() => opcionesDePeriodos(this.periodos(), this.seleccionado()));

  elegir(opcion: DropdownItem): void {
    if (opcion.id) {
      this.seleccionar.emit(opcion.id);
    }
  }

  abrirCreacion(): void {
    this.periodoNuevo.setValue(
      sugerirPeriodoNuevo(
        this.periodos().map((fila) => fila.periodo),
        new Date(),
      ),
    );
    this.periodoNuevo.markAsUntouched();
    this.creando.set(true);
  }

  cerrarCreacion(): void {
    this.creando.set(false);
  }

  crear(): void {
    this.periodoNuevo.markAsTouched();
    if (this.periodoNuevo.invalid) {
      return;
    }
    this.seleccionar.emit(this.periodoNuevo.value);
    this.creando.set(false);
  }
}
