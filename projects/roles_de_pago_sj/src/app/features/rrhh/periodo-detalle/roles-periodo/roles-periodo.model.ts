import type { RolFila } from '../../rrhh.model';

export interface ContextoAcciones {
  publicado: boolean;
  puedeVerAjenos: boolean;
  /** Período publicado en modo edición: ahí sí se puede retirar y reponer (con motivo). */
  editando?: boolean;
}

export interface ManejadoresAcciones {
  ver: (fila: RolFila) => void;
  inactivar: (fila: RolFila) => void;
  activar: (fila: RolFila) => void;
  reenviar: (fila: RolFila) => void;
}
