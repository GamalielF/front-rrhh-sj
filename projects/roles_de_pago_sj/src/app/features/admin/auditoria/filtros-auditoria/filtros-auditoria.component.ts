import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, CardComponent, DropdownComponent, DropdownItem, GridComponent, InputComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import {
  FILTROS_VACIOS,
  FiltrosAuditoria,
  ModoAuditoria,
  OPCIONES_RESULTADO,
  OPCIONES_TIPO_ACCESO,
  OPCIONES_TIPO_ACCION,
} from '../auditoria.model';
import { etiquetaDeFiltro, opcionesDeFiltro, valorDeOpcion, validarFiltros } from '../auditoria.util';

@Component({
  selector: 'app-filtros-auditoria',
  standalone: true,
  imports: [ReactiveFormsModule, AvisoComponent, ButtonComponent, CardComponent, DropdownComponent, GridComponent, InputComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filtros-auditoria.component.html',
  styleUrls: ['./filtros-auditoria.component.css'],
})
export class FiltrosAuditoriaComponent {
  readonly modo = input.required<ModoAuditoria>();
  readonly buscar = output<FiltrosAuditoria>();

  readonly formulario = new FormGroup({
    desde: new FormControl('', { nonNullable: true }),
    hasta: new FormControl('', { nonNullable: true }),
    usuario: new FormControl('', { nonNullable: true }),
    periodo: new FormControl('', { nonNullable: true }),
    minimo: new FormControl<number | string>(FILTROS_VACIOS.minimo, { nonNullable: true }),
  });
  readonly resultado = signal('');
  readonly tipoAcceso = signal('');
  readonly tipoAccion = signal('');
  readonly error = signal('');

  readonly itemsResultado = computed(() => opcionesDeFiltro(OPCIONES_RESULTADO, this.resultado()));
  readonly etiquetaResultado = computed(() => etiquetaDeFiltro(OPCIONES_RESULTADO, this.resultado(), 'Resultado'));
  readonly itemsTipoAcceso = computed(() => opcionesDeFiltro(OPCIONES_TIPO_ACCESO, this.tipoAcceso()));
  readonly etiquetaTipoAcceso = computed(() => etiquetaDeFiltro(OPCIONES_TIPO_ACCESO, this.tipoAcceso(), 'Tipo'));
  readonly itemsTipoAccion = computed(() => opcionesDeFiltro(OPCIONES_TIPO_ACCION, this.tipoAccion()));
  readonly etiquetaTipoAccion = computed(() => etiquetaDeFiltro(OPCIONES_TIPO_ACCION, this.tipoAccion(), 'Acción'));

  constructor() {
    effect(() => {
      this.modo();
      untracked(() => {
        this.resultado.set('');
        this.tipoAcceso.set('');
        this.tipoAccion.set('');
        this.error.set('');
      });
    });
  }

  elegirResultado(opcion: DropdownItem): void {
    this.resultado.set(valorDeOpcion(opcion.id));
  }

  elegirTipoAcceso(opcion: DropdownItem): void {
    this.tipoAcceso.set(valorDeOpcion(opcion.id));
  }

  elegirTipoAccion(opcion: DropdownItem): void {
    this.tipoAccion.set(valorDeOpcion(opcion.id));
  }

  aplicar(): void {
    const filtros = this.leerFiltros();
    const problema = validarFiltros(filtros, this.modo(), new Date());
    this.error.set(problema ?? '');
    if (!problema) {
      this.buscar.emit(filtros);
    }
  }

  limpiar(): void {
    this.formulario.reset({ minimo: FILTROS_VACIOS.minimo });
    this.resultado.set('');
    this.tipoAcceso.set('');
    this.tipoAccion.set('');
    this.error.set('');
    this.buscar.emit({ ...FILTROS_VACIOS });
  }

  private leerFiltros(): FiltrosAuditoria {
    const valores = this.formulario.getRawValue();
    return {
      desde: valores.desde,
      hasta: valores.hasta,
      usuario: valores.usuario,
      periodo: valores.periodo,
      resultado: this.resultado(),
      tipoAcceso: this.tipoAcceso(),
      tipoAccion: this.tipoAccion(),
      minimo: Number(valores.minimo),
    };
  }
}
