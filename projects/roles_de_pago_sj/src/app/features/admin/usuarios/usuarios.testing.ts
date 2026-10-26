import type { UsuarioAdminResponse } from '@models';

export const usuario = (
  username: string,
  cambios: Partial<UsuarioAdminResponse> = {},
): UsuarioAdminResponse => ({
  username,
  nombre: 'PEREZ LOPEZ JUAN',
  cargo: 'ANALISTA',
  estadoDirectorio: 'ACTIVO',
  roles: [],
  ...cambios,
});
