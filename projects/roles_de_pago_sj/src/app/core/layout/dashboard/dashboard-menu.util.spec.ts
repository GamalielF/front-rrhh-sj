import { construirMenu } from './dashboard-menu.util';

describe('construirMenu', () => {
  const etiquetas = (roles: Parameters<typeof construirMenu>[0]) => construirMenu(roles).map((opcion) => opcion.label);

  it('un empleado solo ve Inicio y Mi rol de pago', () => {
    expect(etiquetas(['EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago']);
    expect(etiquetas([])).toEqual(['Inicio', 'Mi rol de pago']);
  });

  it('RRHH ve además Períodos, pero no la administración', () => {
    expect(etiquetas(['RRHH', 'EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago', 'Períodos']);
  });

  it('ADMIN ve además Períodos y toda la administración', () => {
    expect(etiquetas(['ADMIN', 'EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago', 'Períodos', 'Usuarios y roles', 'Directorio', 'Auditoría']);
  });
});
