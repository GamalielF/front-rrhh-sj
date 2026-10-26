import type { RolAsignadoResponse, UsuarioAdminResponse } from '@models';
import type { UsuarioFila } from './usuarios.model';

const ETIQUETAS_ESTADO: Record<string, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'De baja',
  NO_EXISTE: 'No existe',
};

export function aFilasUsuarios(usuarios: UsuarioAdminResponse[]): UsuarioFila[] {
  return usuarios.map((usuario) => {
    const admin = usuario.roles.find((rol) => rol.rol === 'ADMIN');
    const rrhh = usuario.roles.find((rol) => rol.rol === 'RRHH');
    return {
      username: usuario.username,
      nombre: usuario.nombre ?? '—',
      cargo: usuario.cargo ?? '—',
      estadoDirectorio: usuario.estadoDirectorio ?? 'NO_EXISTE',
      estadoEtiqueta: ETIQUETAS_ESTADO[usuario.estadoDirectorio ?? ''] ?? 'No existe',
      rolesTexto: describirRoles(usuario.roles),
      activo: usuario.estadoDirectorio === 'ACTIVO',
      esAdmin: !!admin,
      adminDeConfiguracion: admin?.origen === 'CONFIGURACION',
      esRrhh: !!rrhh,
      rrhhVeAjenos: !!rrhh?.verRolesAjenos,
    };
  });
}

export function describirRoles(roles: RolAsignadoResponse[]): string {
  const partes = roles.map((rol) => {
    if (rol.rol === 'ADMIN') {
      return rol.origen === 'CONFIGURACION' ? 'Administrador (de arranque)' : 'Administrador';
    }
    return rol.verRolesAjenos ? 'RRHH (ve roles ajenos)' : 'RRHH (no ve roles ajenos)';
  });
  return partes.length > 0 ? partes.join(' · ') : '—';
}
