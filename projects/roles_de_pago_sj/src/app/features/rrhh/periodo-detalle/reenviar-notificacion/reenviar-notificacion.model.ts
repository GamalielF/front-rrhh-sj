import type { RolFila } from '../../rrhh.model';
import type { ResultadoReenvioResponse } from '@models';

export interface ReenvioTerminado {
  fila: RolFila;
  resultado: ResultadoReenvioResponse;
}

export interface ResumenReenvio {
  variante: 'success' | 'danger';
  texto: string;
}
