import { aceptado, filaPerez, rechazado } from './reenviar-notificacion.testing';
import { mensajeDeConfirmacion, resumirReenvio } from './reenviar-notificacion.util';

describe('mensajeDeConfirmacion', () => {
  it('explica adónde va el aviso, quién define su contenido y que queda registrado', () => {
    const mensaje = mensajeDeConfirmacion(filaPerez);
    expect(mensaje).toContain('código de usuario + @coopsanjose.fin.ec');
    expect(mensaje).toContain('la plantilla de la API');
    expect(mensaje).toContain('auditoría');
  });

  it('dice en qué estado está el aviso ahora', () => {
    expect(mensajeDeConfirmacion(filaPerez)).toContain('Estado actual del aviso: Notificado.');
    expect(mensajeDeConfirmacion({ ...filaPerez, notificacion: 'Error de envío' })).toContain('Estado actual del aviso: Error de envío.');
  });
});

describe('resumirReenvio', () => {
  it('si la API aceptó el reenvío lo celebra con el nombre de la persona', () => {
    expect(resumirReenvio({ fila: filaPerez, resultado: aceptado })).toEqual({
      variante: 'success',
      texto: 'Aviso reenviado a PEREZ JUAN. La API de correo aceptó el envío.',
    });
  });

  it('si no lo aceptó dice a quién y por qué', () => {
    expect(resumirReenvio({ fila: filaPerez, resultado: rechazado })).toEqual({
      variante: 'danger',
      texto: 'No se pudo reenviar a PEREZ JUAN: La API de correo no respondió a tiempo',
    });
  });
});
