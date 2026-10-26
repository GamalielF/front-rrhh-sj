import type { TableColumn } from '@lumen/ui';
import type { ResultadoArchivoResponse } from '@models';

export const MAX_BYTES_ARCHIVO = 5 * 1024 * 1024;
export const MAX_ARCHIVOS_LOTE = 100;
export const MAX_BYTES_LOTE = 80 * 1024 * 1024;
export const PATRON_ARCHIVO = /^\d{10}\.pdf$/i;

export interface ArchivoDescartado {
  archivo: string;
  mensaje: string;
}

export interface ResumenCarga {
  cargados: number;
  reemplazados: number;
  sinCambios: number;
  rechazados: number;
  resultados: ResultadoArchivoResponse[];
}

export interface ProgresoCarga {
  loteActual: number;
  totalLotes: number;
  resumen: ResumenCarga;
}

export const COLUMNAS_DESCARTADOS: TableColumn<ArchivoDescartado>[] = [
  { key: 'archivo', title: 'Archivo' },
  { key: 'mensaje', title: 'Motivo' },
];

export const COLUMNAS_RECHAZADOS: TableColumn<ResultadoArchivoResponse>[] = [
  { key: 'archivo', title: 'Archivo' },
  { key: 'mensaje', title: 'Motivo' },
];
