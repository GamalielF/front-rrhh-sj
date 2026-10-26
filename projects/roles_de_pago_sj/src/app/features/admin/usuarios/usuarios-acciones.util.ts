import type { TableAction } from '@lumen/ui';
import type { CambioPendiente, CambioRol, ContextoAcciones, UsuarioFila } from './usuarios.model';

type Solicitar = (fila: UsuarioFila, cambio: CambioRol) => void;

export function accionesDeUsuario(contexto: ContextoAcciones, solicitar: Solicitar): TableAction<UsuarioFila>[] {
  const accion = (
    label: string,
    icon: string,
    cambio: CambioRol,
    oculta: (fila: UsuarioFila) => boolean,
    variant: TableAction['variant'] = 'default',
  ): TableAction<UsuarioFila> => ({
    label,
    icon,
    variant,
    hidden: oculta,
    onClick: (fila) => solicitar(fila, cambio),
  });

  return [
    accion('Asignar RRHH (ve roles ajenos)', '@tui.user-plus', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true }, (f) => !f.activo || f.esRrhh || f.esAdmin),
    accion('Asignar RRHH (no ve roles ajenos)', '@tui.user-plus', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false }, (f) => !f.activo || f.esRrhh || f.esAdmin),
    accion('Permitir ver roles ajenos', '@tui.eye', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true }, (f) => !f.esRrhh || f.rrhhVeAjenos),
    accion('Quitar permiso de ver roles ajenos', '@tui.eye', { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false }, (f) => !f.esRrhh || !f.rrhhVeAjenos),
    accion('Hacer administrador', '@tui.shield-check', { tipo: 'otorgar', rol: 'ADMIN' }, (f) => !f.activo || f.esAdmin),
    accion('Quitar RRHH', '@tui.x', { tipo: 'revocar', rol: 'RRHH' }, (f) => !f.esRrhh, 'danger'),
    accion(
      'Quitar administrador',
      '@tui.x',
      { tipo: 'revocar', rol: 'ADMIN' },
      (f) => !f.esAdmin || f.adminDeConfiguracion || f.username === contexto.usuarioActual,
      'danger',
    ),
  ];
}

export function requiereConfirmacion(cambio: CambioRol): boolean {
  return cambio.tipo === 'revocar' || cambio.rol === 'ADMIN';
}

export function describirCambio(fila: UsuarioFila, cambio: CambioRol): CambioPendiente {
  const persona = fila.nombre === '—' ? fila.username : fila.nombre;
  if (cambio.tipo === 'revocar') {
    return {
      fila,
      cambio,
      titulo: cambio.rol === 'ADMIN' ? 'Quitar administrador' : 'Quitar RRHH',
      mensaje: `${persona} dejará de tener el rol ${cambio.rol === 'ADMIN' ? 'de administrador' : 'RRHH'}. Podrá volver a asignarse después.`,
      etiquetaConfirmar: 'Quitar',
      peligro: true,
      exito: `Se quitó el rol ${cambio.rol} a ${persona}.`,
    };
  }
  if (cambio.rol === 'ADMIN') {
    return {
      fila,
      cambio,
      titulo: 'Hacer administrador',
      mensaje: `${persona} podrá gestionar usuarios, el directorio y la auditoría, y ver cualquier rol de pago.`,
      etiquetaConfirmar: 'Hacer administrador',
      peligro: false,
      exito: `${persona} ahora es administrador.`,
    };
  }
  const permiso = cambio.verRolesAjenos === false ? 'no ve' : 've';
  return {
    fila,
    cambio,
    titulo: 'Asignar RRHH',
    mensaje: '',
    etiquetaConfirmar: 'Asignar',
    peligro: false,
    exito: fila.esRrhh
      ? `Permiso actualizado: ${persona} ${permiso} roles ajenos.`
      : `${persona} ahora es RRHH y ${permiso} roles ajenos.`,
  };
}
