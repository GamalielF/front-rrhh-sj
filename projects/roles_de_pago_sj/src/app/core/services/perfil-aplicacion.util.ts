import type { NombreRol, PerfilResponse } from '../models';

export function tieneAlgunRol(perfil: PerfilResponse | null, permitidos: readonly NombreRol[]): boolean {
  return !!perfil && perfil.roles.some((rol) => permitidos.includes(rol));
}

export function puedeVerRolesAjenos(perfil: PerfilResponse | null): boolean {
  return !!perfil && (perfil.roles.includes('ADMIN') || perfil.permisos.includes('VER_ROLES_AJENOS'));
}
