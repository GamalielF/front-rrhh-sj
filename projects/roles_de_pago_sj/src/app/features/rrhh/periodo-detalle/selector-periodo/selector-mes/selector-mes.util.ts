import { PATRON_PERIODO } from '../../../rrhh.model';

export const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

export interface CeldaMes {
  periodo: string;
  nombre: string;
  deshabilitada: boolean;
  seleccionada: boolean;
  existe: boolean;
}

export interface OpcionesCeldas {
  minimo: string;
  maximo: string;
  seleccionado: string;
  existentes: readonly string[];
}

export function celdasDelAnio(anio: number, { minimo, maximo, seleccionado, existentes }: OpcionesCeldas): CeldaMes[] {
  return NOMBRES_MESES.map((nombre, indice) => {
    const periodo = `${anio}-${String(indice + 1).padStart(2, '0')}`;
    return {
      periodo,
      nombre,
      deshabilitada: periodo < minimo || periodo > maximo,
      seleccionada: periodo === seleccionado,
      existe: existentes.includes(periodo),
    };
  });
}

export function anioInicial(seleccionado: string, referencia: string, minimo: string, maximo: string): number {
  const candidato = PATRON_PERIODO.test(seleccionado) ? seleccionado : referencia;
  const acotado = candidato < minimo ? minimo : candidato > maximo ? maximo : candidato;
  return Number(acotado.slice(0, 4));
}
