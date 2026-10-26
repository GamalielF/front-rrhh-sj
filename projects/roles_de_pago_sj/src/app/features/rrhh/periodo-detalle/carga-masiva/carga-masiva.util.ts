import type { ResultadoCargaResponse } from '@models';
import {
  ArchivoDescartado,
  MAX_ARCHIVOS_LOTE,
  MAX_BYTES_ARCHIVO,
  MAX_BYTES_LOTE,
  PATRON_ARCHIVO,
  ProgresoCarga,
} from './carga-masiva.model';

export function validarArchivo(archivo: File): string | null {
  if (!PATRON_ARCHIVO.test(archivo.name)) {
    return 'El nombre debe ser la cédula de 10 dígitos y terminar en .pdf';
  }
  if (archivo.size === 0) {
    return 'El archivo está vacío';
  }
  return archivo.size > MAX_BYTES_ARCHIVO ? 'Supera el máximo de 5 MB' : null;
}

export function clasificarArchivos(archivos: File[]): { validos: File[]; descartados: ArchivoDescartado[] } {
  const vistos = new Set<string>();
  const validos: File[] = [];
  const descartados: ArchivoDescartado[] = [];
  for (const archivo of archivos) {
    const clave = archivo.name.toLowerCase();
    const motivo = vistos.has(clave) ? 'Archivo repetido en la selección' : validarArchivo(archivo);
    if (motivo) {
      descartados.push({ archivo: archivo.name, mensaje: motivo });
    } else {
      validos.push(archivo);
    }
    vistos.add(clave);
  }
  return { validos, descartados };
}

export function sumarBytes(archivos: File[]): number {
  return archivos.reduce((total, archivo) => total + archivo.size, 0);
}

export function crearLotes(
  archivos: File[],
  maxArchivos = MAX_ARCHIVOS_LOTE,
  maxBytes = MAX_BYTES_LOTE,
): File[][] {
  const lotes: File[][] = [];
  let actual: File[] = [];
  let bytes = 0;
  for (const archivo of archivos) {
    if (actual.length > 0 && (actual.length >= maxArchivos || bytes + archivo.size > maxBytes)) {
      lotes.push(actual);
      actual = [];
      bytes = 0;
    }
    actual.push(archivo);
    bytes += archivo.size;
  }
  if (actual.length > 0) {
    lotes.push(actual);
  }
  return lotes;
}

export function progresoInicial(totalLotes: number): ProgresoCarga {
  return {
    loteActual: 0,
    totalLotes,
    resumen: { cargados: 0, reemplazados: 0, sinCambios: 0, rechazados: 0, resultados: [] },
  };
}

export function acumularProgreso(anterior: ProgresoCarga, lote: ResultadoCargaResponse): ProgresoCarga {
  const { resumen } = anterior;
  return {
    loteActual: anterior.loteActual + 1,
    totalLotes: anterior.totalLotes,
    resumen: {
      cargados: resumen.cargados + lote.cargados,
      reemplazados: resumen.reemplazados + lote.reemplazados,
      sinCambios: resumen.sinCambios + lote.sinCambios,
      rechazados: resumen.rechazados + lote.rechazados,
      resultados: [...resumen.resultados, ...lote.resultados],
    },
  };
}
