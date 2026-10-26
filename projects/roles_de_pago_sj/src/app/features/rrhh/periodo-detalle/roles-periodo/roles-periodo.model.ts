import type { RolFila } from '../../rrhh.model';

export interface ContextoAcciones {
  publicado: boolean;
  puedeVerAjenos: boolean;
}

export interface ManejadoresAcciones {
  ver: (fila: RolFila) => void;
  inactivar: (fila: RolFila) => void;
  activar: (fila: RolFila) => void;
}
