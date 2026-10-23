export const CEDULA_DE_10_DIGITOS = /^\d{10}$/;

export const TIEMPO_BLOQUEO_MS = 60_000;

export const MENSAJE_GENERICO = 'No se pudo completar la consulta. Intente nuevamente más tarde.';

export const MENSAJES_POR_ESTADO: Record<number, string> = {
  0: 'No hay conexión con el servidor. Revise su red e intente nuevamente.',
  401: 'Su sesión expiró. Inicie sesión nuevamente.',
  403: 'No tiene permiso para realizar esta consulta.',
  404: 'No se encontró un rol de pago publicado para ese período.',
  429: 'Demasiados intentos fallidos. Espere unos minutos antes de volver a intentar.',
};

export const MENSAJES_CEDULA: Record<string, string> = {
  required: 'Ingrese su número de cédula',
  pattern: 'La cédula debe tener 10 dígitos',
  cedulaNoCoincide: 'No coincide con la cédula de su cuenta',
};
