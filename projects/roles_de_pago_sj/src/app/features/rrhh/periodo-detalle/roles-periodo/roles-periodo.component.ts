import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardComponent, InputComponent, TableComponent } from '@lumen/ui';
import type { RolPagoResumenResponse } from '@models';
import { COLUMNAS_ROLES, RolFila } from '../../rrhh.model';
import { aFilasRoles, filtrarRoles } from '../../rrhh.util';
import { accionesDeRol } from './roles-periodo.util';

@Component({
  selector: 'app-roles-periodo',
  standalone: true,
  imports: [ReactiveFormsModule, CardComponent, InputComponent, TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './roles-periodo.component.html',
  styleUrls: ['./roles-periodo.component.css'],
})
export class RolesPeriodoComponent {
  readonly roles = input<RolPagoResumenResponse[]>([]);
  readonly cargando = input(false);
  readonly publicado = input(false);
  readonly puedeVerAjenos = input(false);

  readonly ver = output<RolFila>();
  readonly inactivar = output<RolFila>();
  readonly activar = output<RolFila>();
  readonly reenviar = output<RolFila>();

  readonly columnas = COLUMNAS_ROLES;
  readonly filtro = new FormControl('', { nonNullable: true });
  private texto = toSignal(this.filtro.valueChanges, { initialValue: '' });

  readonly filas = computed(() => filtrarRoles(aFilasRoles(this.roles(), this.publicado()), this.texto()));
  readonly subtitulo = computed(() => `${this.filas().length} de ${this.roles().length} roles`);
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
}
