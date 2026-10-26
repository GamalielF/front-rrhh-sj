import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ButtonComponent, PageContainerComponent } from '@lumen/ui';
import { FILTROS_VACIOS, FiltrosAuditoria, MODOS_AUDITORIA, ModoAuditoria } from './auditoria.model';
import { FiltrosAuditoriaComponent } from './filtros-auditoria';
import { PanelAccesosComponent } from './panel-accesos';
import { PanelAccionesComponent } from './panel-acciones';
import { PanelDenegadosComponent } from './panel-denegados';

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    ButtonComponent,
    PageContainerComponent,
    FiltrosAuditoriaComponent,
    PanelAccesosComponent,
    PanelAccionesComponent,
    PanelDenegadosComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.css'],
})
export class AuditoriaComponent {
  readonly modos = MODOS_AUDITORIA;
  readonly modo = signal<ModoAuditoria>('accesos');
  readonly filtros = signal<FiltrosAuditoria>({ ...FILTROS_VACIOS });

  cambiarModo(modo: ModoAuditoria): void {
    if (modo === this.modo()) {
      return;
    }
    this.modo.set(modo);
    this.filtros.update((filtros) => ({ ...filtros, resultado: '', tipoAcceso: '', tipoAccion: '' }));
  }
}
