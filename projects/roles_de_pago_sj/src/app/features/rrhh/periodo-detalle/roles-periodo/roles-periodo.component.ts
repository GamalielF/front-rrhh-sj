import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardComponent, InputComponent, TableComponent } from '@lumen/ui';
import type { RolPagoResumenResponse } from '@models';
import { COLUMNAS_ROLES } from '../../rrhh.model';
import { aFilasRoles, filtrarRoles } from '../../rrhh.util';

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

  readonly columnas = COLUMNAS_ROLES;
  readonly filtro = new FormControl('', { nonNullable: true });
  private texto = toSignal(this.filtro.valueChanges, { initialValue: '' });

  readonly filas = computed(() => filtrarRoles(aFilasRoles(this.roles()), this.texto()));
  readonly subtitulo = computed(() => `${this.filas().length} de ${this.roles().length} roles`);
}
