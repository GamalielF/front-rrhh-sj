import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, Validators } from '@angular/forms';
import { ButtonComponent, DropdownComponent, DropdownItem, ModalComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import { formatearPeriodo } from '@core/utils';
import { PATRON_PERIODO, PERIODO_MINIMO, PeriodoFila } from '../../rrhh.model';
import { opcionesDePeriodos, periodoEnRango, sugerirPeriodoNuevo, ultimoPeriodoPermitido } from '../../rrhh.util';
import { SelectorMesComponent } from './selector-mes';

@Component({
  selector: 'app-selector-periodo',
  standalone: true,
  imports: [AvisoComponent, ButtonComponent, DropdownComponent, ModalComponent, SelectorMesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './selector-periodo.component.html',
  styleUrls: ['./selector-periodo.component.css'],
})
export class SelectorPeriodoComponent {
  readonly periodos = input<PeriodoFila[]>([]);
  readonly seleccionado = input.required<string>();
  readonly seleccionar = output<string>();

  readonly minimo = PERIODO_MINIMO;
  readonly maximo = ultimoPeriodoPermitido(new Date());
  readonly etiquetaMaximo = formatearPeriodo(this.maximo);
  readonly creando = signal(false);
  readonly periodoNuevo = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(PATRON_PERIODO), periodoEnRango(() => new Date())],
  });

  private nuevo = toSignal(this.periodoNuevo.valueChanges, { initialValue: this.periodoNuevo.value });
  readonly etiqueta = computed(() => formatearPeriodo(this.seleccionado()));
  readonly existentes = computed(() => this.periodos().map((fila) => fila.periodo));
  readonly etiquetaNueva = computed(() => (PATRON_PERIODO.test(this.nuevo()) ? formatearPeriodo(this.nuevo()) : ''));
  readonly yaExiste = computed(() => this.existentes().includes(this.nuevo()));
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

  elegirMes(periodo: string): void {
    this.periodoNuevo.setValue(periodo);
    this.periodoNuevo.markAsTouched();
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
