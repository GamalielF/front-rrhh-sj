import type { PerfilResponse } from '@models';
import { tieneAlgunRol } from './perfil-aplicacion.util';

const perfil = (roles: PerfilResponse['roles']): PerfilResponse => ({
  username: 'x',
  nombre: null,
  cargo: null,
  cedulaEnmascarada: null,
  puedeConsultarSuRol: true,
  roles,
  permisos: [],
});

describe('tieneAlgunRol', () => {
  it('acepta si la persona tiene al menos uno de los roles permitidos', () => {
    expect(tieneAlgunRol(perfil(['RRHH', 'EMPLEADO']), ['ADMIN', 'RRHH'])).toBe(true);
  });

  it('rechaza a un empleado y a quien no tiene perfil', () => {
    expect(tieneAlgunRol(perfil(['EMPLEADO']), ['ADMIN', 'RRHH'])).toBe(false);
    expect(tieneAlgunRol(null, ['ADMIN', 'RRHH'])).toBe(false);
  });
});
