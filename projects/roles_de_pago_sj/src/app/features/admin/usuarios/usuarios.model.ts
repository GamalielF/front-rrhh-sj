import type { TableColumn } from '@lumen/ui';
import type { NombreRol } from '@models';

export interface UsuarioFila {
  username: string;
  nombre: string;
  cargo: string;
  estadoDirectorio: string;
  estadoEtiqueta: string;
  rolesTexto: string;
  activo: boolean;
  esAdmin: boolean;
  adminDeConfiguracion: boolean;
  esRrhh: boolean;
  rrhhVeAjenos: boolean;
}

export type CambioRol =
  | { tipo: 'otorgar'; rol: NombreRol; verRolesAjenos?: boolean }
  | { tipo: 'revocar'; rol: NombreRol };

export interface CambioPendiente {
  fila: UsuarioFila;
  cambio: CambioRol;
  titulo: string;
  mensaje: string;
  etiquetaConfirmar: string;
  peligro: boolean;
  exito: string;
}

export interface ContextoAcciones {
  usuarioActual: string;
}

export const TAMANO_PAGINA = 20;
export const RETARDO_BUSQUEDA_MS = 300;

export const COLUMNAS_USUARIOS: TableColumn<UsuarioFila>[] = [
  { key: 'username', title: 'Usuario' },
  { key: 'nombre', title: 'Nombre' },
  { key: 'cargo', title: 'Cargo' },
  {
    key: 'estadoEtiqueta',
    title: 'Directorio',
    type: 'badge',
    badgeVariant: (fila) => (fila.activo ? 'success' : 'neutral'),
  },
  { key: 'rolesTexto', title: 'Acceso especial' },
];
