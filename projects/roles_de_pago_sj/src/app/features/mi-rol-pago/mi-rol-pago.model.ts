export const CEDULA_DE_10_DIGITOS = /^\d{10}$/;

export const TIEMPO_BLOQUEO_MS = 60_000;

export const MENSAJES_CONSULTA: Record<number, string> = {
  404: 'No se encontró un rol de pago publicado para ese período.',
  429: 'Demasiados intentos fallidos. Espere unos minutos antes de volver a intentar.',
};

export const MENSAJES_CEDULA: Record<string, string> = {
  required: 'Ingrese su número de cédula',
  pattern: 'La cédula debe tener 10 dígitos',
  cedulaNoCoincide: 'No coincide con la cédula de su cuenta',
};
