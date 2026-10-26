import { accionesDeUsuario, describirCambio, requiereConfirmacion } from './usuarios-acciones.util';
import type { UsuarioFila } from './usuarios.model';
import { aFilasUsuarios } from './usuarios.util';
import { usuario } from './usuarios.testing';

const fila = (username: string, cambios: Parameters<typeof usuario>[1] = {}): UsuarioFila =>
  aFilasUsuarios([usuario(username, cambios)])[0];

const RRHH = { rol: 'RRHH' as const, origen: 'ASIGNADO', verRolesAjenos: true };
const RRHH_SIN_PERMISO = { ...RRHH, verRolesAjenos: false };
const ADMIN = { rol: 'ADMIN' as const, origen: 'ASIGNADO', verRolesAjenos: true };
const ADMIN_ARRANQUE = { ...ADMIN, origen: 'CONFIGURACION' };

const visibles = (f: UsuarioFila, usuarioActual = 'fsepa') =>
  accionesDeUsuario({ usuarioActual }, vi.fn())
    .filter((accion) => !accion.hidden?.(f))
    .map((accion) => accion.label);

describe('accionesDeUsuario', () => {
  it('a un empleado activo se le puede asignar RRHH (de dos formas) o hacer administrador', () => {
    expect(visibles(fila('jperez'))).toEqual([
      'Asignar RRHH (ve roles ajenos)',
      'Asignar RRHH (no ve roles ajenos)',
      'Hacer administrador',
    ]);
  });

  it('a un RRHH que ve roles ajenos se le puede quitar ese permiso, quitar RRHH o hacerlo administrador', () => {
    expect(visibles(fila('jperez', { roles: [RRHH] }))).toEqual([
      'Quitar permiso de ver roles ajenos',
      'Hacer administrador',
      'Quitar RRHH',
    ]);
  });

  it('a un RRHH sin ese permiso se le puede conceder', () => {
    expect(visibles(fila('jperez', { roles: [RRHH_SIN_PERMISO] }))).toContain('Permitir ver roles ajenos');
  });

  it('un administrador asignado se puede quitar, pero no a uno mismo', () => {
    expect(visibles(fila('mmora', { roles: [ADMIN] }))).toContain('Quitar administrador');
    expect(visibles(fila('fsepa', { roles: [ADMIN] }), 'fsepa')).not.toContain('Quitar administrador');
  });

  it('un administrador de arranque no se puede quitar desde aquí, y tampoco necesita RRHH', () => {
    expect(visibles(fila('msavala', { roles: [ADMIN_ARRANQUE] }))).toEqual([]);
  });

  it('a un administrador asignado no se le ofrece RRHH, porque ya puede todo lo de RRHH', () => {
    expect(visibles(fila('mmora', { roles: [ADMIN] }))).toEqual(['Quitar administrador']);
  });

  it('a alguien dado de baja no se le asigna nada, pero sí se le puede quitar lo que tenía', () => {
    expect(visibles(fila('zz.baja', { estadoDirectorio: 'INACTIVO' }))).toEqual([]);
    expect(visibles(fila('zz.baja', { estadoDirectorio: 'INACTIVO', roles: [RRHH] }))).toEqual([
      'Quitar permiso de ver roles ajenos',
      'Quitar RRHH',
    ]);
  });

  it('cada acción pide su cambio con la fila elegida', () => {
    const solicitar = vi.fn();
    const f = fila('jperez');
    const acciones = accionesDeUsuario({ usuarioActual: 'fsepa' }, solicitar);
    const porNombre = (etiqueta: string) => acciones.find((accion) => accion.label === etiqueta);
    porNombre('Asignar RRHH (ve roles ajenos)')?.onClick?.(f);
    porNombre('Hacer administrador')?.onClick?.(f);
    expect(solicitar).toHaveBeenNthCalledWith(1, f, { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true });
    expect(solicitar).toHaveBeenNthCalledWith(2, f, { tipo: 'otorgar', rol: 'ADMIN' });
  });
});

describe('requiereConfirmacion', () => {
  it('pide confirmar toda revocación y hacer administrador, pero no asignar RRHH ni cambiar el permiso', () => {
    expect(requiereConfirmacion({ tipo: 'revocar', rol: 'RRHH' })).toBe(true);
    expect(requiereConfirmacion({ tipo: 'revocar', rol: 'ADMIN' })).toBe(true);
    expect(requiereConfirmacion({ tipo: 'otorgar', rol: 'ADMIN' })).toBe(true);
    expect(requiereConfirmacion({ tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: true })).toBe(false);
    expect(requiereConfirmacion({ tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false })).toBe(false);
  });
});

describe('describirCambio', () => {
  it('quitar un rol se presenta como acción peligrosa y avisa que se puede volver a asignar', () => {
    const cambio = describirCambio(fila('jperez', { roles: [RRHH] }), { tipo: 'revocar', rol: 'RRHH' });
    expect(cambio).toMatchObject({ titulo: 'Quitar RRHH', peligro: true, etiquetaConfirmar: 'Quitar' });
    expect(cambio.mensaje).toContain('PEREZ LOPEZ JUAN dejará de tener el rol RRHH');
    expect(cambio.mensaje).toContain('volver a asignarse');
  });

  it('hacer administrador explica lo que podrá hacer', () => {
    const cambio = describirCambio(fila('jperez'), { tipo: 'otorgar', rol: 'ADMIN' });
    expect(cambio.mensaje).toContain('gestionar usuarios, el directorio y la auditoría');
    expect(cambio.exito).toBe('PEREZ LOPEZ JUAN ahora es administrador.');
  });

  it('el mensaje de éxito de RRHH distingue asignar de actualizar el permiso', () => {
    const nuevo = describirCambio(fila('jperez'), { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false });
    expect(nuevo.exito).toBe('PEREZ LOPEZ JUAN ahora es RRHH y no ve roles ajenos.');
    const existente = describirCambio(fila('jperez', { roles: [RRHH] }), { tipo: 'otorgar', rol: 'RRHH', verRolesAjenos: false });
    expect(existente.exito).toBe('Permiso actualizado: PEREZ LOPEZ JUAN no ve roles ajenos.');
  });

  it('sin nombre en el directorio nombra a la persona por su usuario', () => {
    const cambio = describirCambio(fila('zz.baja', { nombre: null }), { tipo: 'revocar', rol: 'RRHH' });
    expect(cambio.mensaje).toContain('zz.baja dejará de tener');
  });
});
