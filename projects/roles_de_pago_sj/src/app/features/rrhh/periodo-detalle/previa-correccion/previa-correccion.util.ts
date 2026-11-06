import type { ResultadoArchivoResponse } from '@models';
import type { GruposPrevia, PersonaPrevia } from './previa-correccion.model';

function aPersona(resultado: ResultadoArchivoResponse): PersonaPrevia {
  return { cedula: resultado.archivo.replace(/\.pdf$/i, ''), titular: resultado.titular ?? '' };
}

/** Separa lo que la revisión anunció: qué se reemplaza, qué se agrega, qué queda igual y qué se rechaza. */
export function agruparPrevia(resultados: ResultadoArchivoResponse[]): GruposPrevia {
  return {
    reemplazos: resultados.filter((r) => r.estado === 'REEMPLAZADO').map(aPersona),
    nuevos: resultados.filter((r) => r.estado === 'CARGADO').map(aPersona),
    sinCambios: resultados.filter((r) => r.estado === 'SIN_CAMBIOS').length,
    rechazados: resultados.filter((r) => r.estado === 'RECHAZADO'),
  };
}

export function textoReemplazo(cantidad: number): string {
  return cantidad === 1
    ? 'El siguiente rol se va a reemplazar'
    : `Los siguientes ${cantidad} roles se van a reemplazar`;
}

export function textoNuevos(cantidad: number): string {
  return cantidad === 1 ? 'Se agregará 1 rol nuevo' : `Se agregarán ${cantidad} roles nuevos`;
}

/** Cuántas personas recibirán de nuevo su aviso por correo: las del reemplazo y las nuevas. */
export function avisosAEnviar(grupos: GruposPrevia): number {
  return grupos.reemplazos.length + grupos.nuevos.length;
}
