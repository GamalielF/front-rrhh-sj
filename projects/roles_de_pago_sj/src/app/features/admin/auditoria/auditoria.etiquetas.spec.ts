import { ETIQUETAS_ACCION, OPCIONES_TIPO_ACCION } from './auditoria.model';

describe('etiquetas de las acciones de auditoría', () => {
  it('los dos tipos de la corrección de períodos publicados tienen su etiqueta y salen en el filtro', () => {
    expect(ETIQUETAS_ACCION['CARGA_CORRECCION']).toBe('Corrección de un período publicado');
    expect(ETIQUETAS_ACCION['ROL_AGREGADO']).toBe('Rol agregado a un período publicado');
    const valores = OPCIONES_TIPO_ACCION.map((opcion) => opcion.valor);
    expect(valores).toContain('CARGA_CORRECCION');
    expect(valores).toContain('ROL_AGREGADO');
  });
});
