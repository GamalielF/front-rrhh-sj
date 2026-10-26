import type { PerfilResponse } from '@models';
import { puedeVerRolesAjenos, tieneAlgunRol } from './perfil-aplicacion.util';

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

describe('puedeVerRolesAjenos', () => {
  it('ADMIN siempre puede', () => {
    expect(puedeVerRolesAjenos(perfil(['ADMIN']))).toBe(true);
  });

  it('RRHH solo si tiene el permiso VER_ROLES_AJENOS', () => {
    expect(puedeVerRolesAjenos(perfil(['RRHH']))).toBe(false);
    expect(puedeVerRolesAjenos({ ...perfil(['RRHH']), permisos: ['VER_ROLES_AJENOS'] })).toBe(true);
  });

  it('un empleado o quien no tiene perfil no puede', () => {
    expect(puedeVerRolesAjenos(perfil(['EMPLEADO']))).toBe(false);
    expect(puedeVerRolesAjenos(null)).toBe(false);
  });
});
