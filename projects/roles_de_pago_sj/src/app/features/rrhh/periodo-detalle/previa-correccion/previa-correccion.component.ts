import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { BadgeComponent, ButtonComponent, TableComponent } from '@lumen/ui';
import { AvisoComponent } from '@components';
import type { ResumenCarga } from '../carga-masiva/carga-masiva.model';
import { COLUMNAS_PERSONAS, COLUMNAS_RECHAZADOS_PREVIA } from './previa-correccion.model';
import { agruparPrevia, avisosAEnviar, textoNuevos, textoReemplazo } from './previa-correccion.util';

/** Lo que pasaría al corregir el período, antes de hacerlo: RRHH lo revisa y confirma. */
@Component({
  selector: 'app-previa-correccion',
  standalone: true,
  imports: [AvisoComponent, BadgeComponent, ButtonComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './previa-correccion.component.html',
})
export class PreviaCorreccionComponent {
  readonly resumen = input.required<ResumenCarga>();
  readonly aplicando = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  readonly columnasPersonas = COLUMNAS_PERSONAS;
  readonly columnasRechazados = COLUMNAS_RECHAZADOS_PREVIA;
  readonly grupos = computed(() => agruparPrevia(this.resumen().resultados));
  readonly avisos = computed(() => avisosAEnviar(this.grupos()));
  readonly hayCambios = computed(() => this.avisos() > 0);
  readonly textoReemplazo = computed(() => textoReemplazo(this.grupos().reemplazos.length));
  readonly textoNuevos = computed(() => textoNuevos(this.grupos().nuevos.length));
}
