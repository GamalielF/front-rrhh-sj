import type { CoberturaPeriodoResponse, InformeNotificacionesResponse, ResumenPeriodoResponse } from '@models';
import { porcentajeLeido } from '../../rrhh';
import type { Indicador } from '../home.model';

export function indicadoresDe(
  resumen: ResumenPeriodoResponse,
  cobertura: CoberturaPeriodoResponse | null,
  informe: InformeNotificacionesResponse | null,
): Indicador[] {
  const indicadores: Indicador[] = [
    { etiqueta: 'Roles cargados', valor: resumen.rolesActivos, icono: '@tui.file-text', acento: 'blue' },
    {
      etiqueta: 'Personas sin rol',
      valor: resumen.sinRol,
      icono: '@tui.triangle-alert',
      acento: resumen.sinRol > 0 ? 'warning' : 'green',
    },
  ];
  if (cobertura) {
    indicadores.push({
      etiqueta: 'Ya abrieron su rol',
      valor: `${cobertura.leidos} (${porcentajeLeido(cobertura.leidos, cobertura.rolesPublicados)}%)`,
      icono: '@tui.eye',
      acento: 'green',
    });
  }
  if (informe?.habilitadas) {
    indicadores.push({
      etiqueta: 'Avisos fallidos',
      valor: informe.fallidas,
      icono: '@tui.send',
      acento: informe.fallidas > 0 ? 'danger' : 'green',
    });
  }
  return indicadores;
}
