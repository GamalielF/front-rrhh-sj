import type { RolFila } from '../../rrhh.model';
import type { ReenvioTerminado, ResumenReenvio } from './reenviar-notificacion.model';

export function mensajeDeConfirmacion(fila: RolFila): string {
  return (
    `Se enviará de nuevo el aviso al correo institucional de esta persona (su código de usuario + @coopsanjose.fin.ec). ` +
    `El contenido del correo lo define la plantilla de la API, y la acción queda registrada en la auditoría. ` +
    `Estado actual del aviso: ${fila.notificacion}.`
  );
}

export function resumirReenvio({ fila, resultado }: ReenvioTerminado): ResumenReenvio {
  return resultado.aceptado
    ? { variante: 'success', texto: `Aviso reenviado a ${fila.nombre}. La API de correo aceptó el envío.` }
    : { variante: 'danger', texto: `No se pudo reenviar a ${fila.nombre}: ${resultado.mensaje}` };
}
