import { construirMenu } from './dashboard-menu.util';

describe('construirMenu', () => {
  const etiquetas = (roles: Parameters<typeof construirMenu>[0]) => construirMenu(roles).map((opcion) => opcion.label);

  it('un empleado solo ve Inicio y Mi rol de pago', () => {
    expect(etiquetas(['EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago']);
    expect(etiquetas([])).toEqual(['Inicio', 'Mi rol de pago']);
  });

  it('RRHH y ADMIN ven además Períodos', () => {
    expect(etiquetas(['RRHH', 'EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago', 'Períodos']);
    expect(etiquetas(['ADMIN', 'EMPLEADO'])).toEqual(['Inicio', 'Mi rol de pago', 'Períodos']);
  });
});
