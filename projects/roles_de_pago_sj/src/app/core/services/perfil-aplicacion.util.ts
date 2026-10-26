import type { NombreRol, PerfilResponse } from '../models';

export function tieneAlgunRol(perfil: PerfilResponse | null, permitidos: readonly NombreRol[]): boolean {
  return !!perfil && perfil.roles.some((rol) => permitidos.includes(rol));
}
