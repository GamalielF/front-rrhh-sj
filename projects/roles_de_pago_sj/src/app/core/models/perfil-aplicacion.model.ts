import type { NombrePermiso, NombreRol } from './comunes.model';

export interface PerfilResponse {
  username: string;
  nombre: string | null;
  cargo: string | null;
  cedulaEnmascarada: string | null;
  puedeConsultarSuRol: boolean;
  roles: NombreRol[];
  permisos: NombrePermiso[];
}
