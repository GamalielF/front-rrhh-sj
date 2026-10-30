import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent, CardComponent, DropdownComponent, DropdownItem, InputComponent, PaginationComponent, TableComponent } from '@lumen/ui';
import { descargarBlob } from '@core/utils';
import type { RolPagoResumenResponse } from '@models';
import { COLUMNAS_ROLES, GrupoNotificacion, RolFila } from '../../rrhh.model';
import { aFilasRoles, filtrarRoles } from '../../rrhh.util';
import { accionesDeRol } from './roles-periodo.util';
import {
  OPCIONES_ORDEN,
  OrdenRoles,
  TAMANOS_PAGINA,
  TAMANO_PAGINA_INICIAL,
  aCsv,
  chipsDeGrupos,
  filtrarPorGrupo,
  nombreArchivoCsv,
  ordenarRoles,
  paginar,
  ultimaPagina,
} from './roles-tabla.util';

@Component({
  selector: 'app-roles-periodo',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, DropdownComponent, InputComponent, PaginationComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles-periodo.component.html',
  styleUrls: ['./roles-periodo.component.css'],
})
export class RolesPeriodoComponent {
  readonly roles = input<RolPagoResumenResponse[]>([]);
  readonly periodo = input('');
  readonly cargando = input(false);
  readonly publicado = input(false);
  readonly puedeVerAjenos = input(false);
  readonly ver = output<RolFila>();
  readonly inactivar = output<RolFila>();
  readonly activar = output<RolFila>();
  readonly reenviar = output<RolFila>();

  readonly columnas = COLUMNAS_ROLES;
  readonly tamanos = TAMANOS_PAGINA;
  readonly filtro = new FormControl('', { nonNullable: true });
  readonly orden = signal<OrdenRoles>('NOMBRE');
  readonly grupo = signal<GrupoNotificacion | null>(null);
  readonly pagina = signal(0);
  readonly tamanoPagina = signal(TAMANO_PAGINA_INICIAL);

  private texto = toSignal(this.filtro.valueChanges, { initialValue: '' });
  private buscadas = computed(() => filtrarRoles(aFilasRoles(this.roles(), this.publicado()), this.texto()));

  readonly chips = computed(() => chipsDeGrupos(this.buscadas()));
  readonly grupoActivo = computed(() => (this.chips().some((chip) => chip.grupo === this.grupo()) ? this.grupo() : null));
  readonly filas = computed(() => ordenarRoles(filtrarPorGrupo(this.buscadas(), this.grupoActivo()), this.orden()));
  readonly paginaVisible = computed(() => Math.min(this.pagina(), ultimaPagina(this.filas().length, this.tamanoPagina())));
  readonly filasPagina = computed(() => paginar(this.filas(), this.paginaVisible(), this.tamanoPagina()));
  readonly mostrarPaginacion = computed(() => this.filas().length > TAMANOS_PAGINA[0]);
  readonly subtitulo = computed(() => `${this.filas().length} de ${this.roles().length} roles`);

  readonly etiquetaOrden = computed(() => OPCIONES_ORDEN.find((opcion) => opcion.id === this.orden())?.etiqueta ?? '');
  readonly opcionesOrden = computed<DropdownItem[]>(() =>
    OPCIONES_ORDEN.map((opcion) => ({
      id: opcion.id,
      label: opcion.etiqueta,
      icon: opcion.id === this.orden() ? '@tui.check' : undefined,
      variant: opcion.id === this.orden() ? 'brand' : 'default',
    })),
  );

  readonly acciones = computed(() =>
    accionesDeRol(
      { publicado: this.publicado(), puedeVerAjenos: this.puedeVerAjenos() },
      {
        ver: (fila) => this.ver.emit(fila),
        inactivar: (fila) => this.inactivar.emit(fila),
        activar: (fila) => this.activar.emit(fila),
        reenviar: (fila) => this.reenviar.emit(fila),
      },
    ),
  );

  constructor() {
    this.filtro.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.pagina.set(0));
  }

  ordenarPor(opcion: DropdownItem): void {
    this.orden.set(opcion.id as OrdenRoles);
    this.pagina.set(0);
  }

  filtrarGrupo(grupo: GrupoNotificacion | null): void {
    this.grupo.set(grupo);
    this.pagina.set(0);
  }

  cambiarTamano(tamano: number): void {
    this.tamanoPagina.set(tamano);
    this.pagina.set(0);
  }

  exportar(): void {
    descargarBlob(new Blob([aCsv(this.filas())], { type: 'text/csv;charset=utf-8' }), nombreArchivoCsv(this.periodo()));
  }
}
