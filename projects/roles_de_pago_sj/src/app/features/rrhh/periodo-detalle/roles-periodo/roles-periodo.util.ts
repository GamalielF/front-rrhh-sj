import type { TableAction } from '@lumen/ui';
import type { RolFila } from '../../rrhh.model';
import type { ContextoAcciones, ManejadoresAcciones } from './roles-periodo.model';

export function accionesDeRol(contexto: ContextoAcciones, manejadores: ManejadoresAcciones): TableAction<RolFila>[] {
  if (contexto.publicado && !contexto.puedeVerAjenos) {
    return [];
  }
  return [
    { label: 'Ver rol', icon: '@tui.eye', hidden: () => !contexto.puedeVerAjenos, onClick: manejadores.ver },
    {
      label: 'Inactivar',
      icon: '@tui.x',
      variant: 'danger',
      hidden: (fila) => contexto.publicado || fila.estado !== 'ACTIVO',
      onClick: manejadores.inactivar,
    },
    {
      label: 'Activar',
      icon: '@tui.circle-check',
      hidden: (fila) => contexto.publicado || fila.estado === 'ACTIVO',
      onClick: manejadores.activar,
    },
  ];
}
