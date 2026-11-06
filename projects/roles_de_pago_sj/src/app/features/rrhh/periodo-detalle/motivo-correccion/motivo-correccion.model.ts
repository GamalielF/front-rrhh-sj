import type { RolFila } from '../../rrhh.model';

export type TipoCambioRol = 'inactivar' | 'activar';

/** El cambio que RRHH pidió sobre un rol de un período ya publicado y que falta confirmar con un motivo. */
export interface CambioConMotivo {
  tipo: TipoCambioRol;
  rol: RolFila;
}

export const MENSAJES_MOTIVO_CORRECCION: Record<string, string> = {
  required: 'Indique el motivo',
  minlength: 'El motivo debe tener al menos 10 caracteres',
  maxlength: 'El motivo no puede pasar de 200 caracteres',
};

export interface TextosCambio {
  titulo: string;
  explicacion: string;
  boton: string;
  icono: string;
}

export function textosDelCambio(cambio: CambioConMotivo): TextosCambio {
  return cambio.tipo === 'inactivar'
    ? {
        titulo: 'Retirar rol',
        explicacion: `Está por retirar el rol de ${cambio.rol.nombre}. La persona dejará de verlo. Queda registrado en la auditoría con su motivo.`,
        boton: 'Retirar rol',
        icono: '@tui.x',
      }
    : {
        titulo: 'Reponer rol',
        explicacion: `Está por reponer el rol de ${cambio.rol.nombre}. La persona volverá a verlo. Queda registrado en la auditoría con su motivo. Si nunca recibió su aviso, use «Generar los que falten».`,
        boton: 'Reponer rol',
        icono: '@tui.circle-check',
      };
}
