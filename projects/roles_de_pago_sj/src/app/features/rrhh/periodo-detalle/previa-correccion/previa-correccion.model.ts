import type { TableColumn } from '@lumen/ui';
import type { ResultadoArchivoResponse } from '@models';

/** Una persona afectada por la corrección, para mostrarla en una tabla. */
export interface PersonaPrevia {
  cedula: string;
  titular: string;
}

export interface GruposPrevia {
  reemplazos: PersonaPrevia[];
  nuevos: PersonaPrevia[];
  sinCambios: number;
  rechazados: ResultadoArchivoResponse[];
}

export const COLUMNAS_PERSONAS: TableColumn<PersonaPrevia>[] = [
  { key: 'cedula', title: 'Cédula' },
  { key: 'titular', title: 'Titular' },
];

export const COLUMNAS_RECHAZADOS_PREVIA: TableColumn<ResultadoArchivoResponse>[] = [
  { key: 'archivo', title: 'Archivo' },
  { key: 'mensaje', title: 'Motivo' },
];
