import type { NavItem } from '@lumen/ui';
import type { NombreRol } from '@models';
import { OPCION_INICIO, OPCION_MI_ROL, OPCION_PERIODOS } from './dashboard-menu.model';

export function construirMenu(roles: readonly NombreRol[]): NavItem[] {
  const opciones = [OPCION_INICIO, OPCION_MI_ROL];
  if (roles.includes('RRHH') || roles.includes('ADMIN')) {
    opciones.push(OPCION_PERIODOS);
  }
  return opciones;
}
