import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { PageContainerComponent } from '@lumen/ui';
import { PerfilAplicacionService } from '@services';
import type { NombreRol } from '@models';
import { AccesosRapidosComponent } from './accesos-rapidos';
import { AlertasAdminComponent } from './alertas-admin';
import { EstadoPeriodoComponent } from './estado-periodo';
import { accesosRapidosDe } from './home.util';
import { RolRecienteComponent } from './rol-reciente';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    PageContainerComponent,
    RolRecienteComponent,
    EstadoPeriodoComponent,
    AlertasAdminComponent,
    AccesosRapidosComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  private perfilAplicacion = inject(PerfilAplicacionService);

  private roles = toSignal(this.perfilAplicacion.perfil().pipe(map((perfil) => perfil?.roles ?? [])), {
    initialValue: [] as NombreRol[],
  });

  readonly esGestor = computed(() => this.roles().includes('RRHH') || this.roles().includes('ADMIN'));
  readonly esAdmin = computed(() => this.roles().includes('ADMIN'));
  readonly accesos = computed(() => accesosRapidosDe(this.roles()));
}
