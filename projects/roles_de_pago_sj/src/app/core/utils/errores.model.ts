export const MENSAJE_GENERICO = 'No se pudo completar la operación. Intente nuevamente más tarde.';

export const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No hay conexión con el servidor. Revise su red e intente nuevamente.',
  401: 'Su sesión expiró. Inicie sesión nuevamente.',
  403: 'No tiene permiso para realizar esta operación.',
  404: 'No se encontró lo solicitado.',
  413: 'El archivo o el envío es demasiado grande.',
  429: 'Demasiados intentos. Espere unos minutos antes de volver a intentar.',
};
