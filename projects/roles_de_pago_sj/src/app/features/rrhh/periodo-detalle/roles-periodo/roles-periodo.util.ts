import type { TableAction } from '@lumen/ui';
import type { RolFila } from '../../rrhh.model';
import type { ContextoAcciones, ManejadoresAcciones } from './roles-periodo.model';

/** Publicado y sin editar: los roles no se tocan. Editando el período, sí. */
function bloqueado(contexto: ContextoAcciones): boolean {
  return contexto.publicado && !contexto.editando;
}

export function accionesDeRol(contexto: ContextoAcciones, manejadores: ManejadoresAcciones): TableAction<RolFila>[] {
  return [
    { label: 'Ver rol', icon: '@tui.eye', hidden: () => !contexto.puedeVerAjenos, onClick: manejadores.ver },
    {
      label: 'Reenviar notificación',
      icon: '@tui.send',
      hidden: (fila) => !contexto.publicado || fila.estado !== 'ACTIVO' || !fila.reenviable,
      onClick: manejadores.reenviar,
    },
    {
      label: 'Inactivar',
      icon: '@tui.x',
      variant: 'danger',
      hidden: (fila) => bloqueado(contexto) || fila.estado !== 'ACTIVO',
      onClick: manejadores.inactivar,
    },
    {
      label: 'Activar',
      icon: '@tui.circle-check',
      hidden: (fila) => bloqueado(contexto) || fila.estado === 'ACTIVO',
      onClick: manejadores.activar,
    },
  ];
}
