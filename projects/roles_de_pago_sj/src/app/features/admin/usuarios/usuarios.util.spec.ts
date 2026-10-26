import { usuario } from './usuarios.testing';
import { aFilasUsuarios, describirRoles } from './usuarios.util';

describe('describirRoles', () => {
  it('distingue al administrador de arranque, al asignado y los dos tipos de RRHH', () => {
    expect(describirRoles([{ rol: 'ADMIN', origen: 'CONFIGURACION', verRolesAjenos: true }])).toBe('Administrador (de arranque)');
    expect(describirRoles([{ rol: 'ADMIN', origen: 'ASIGNADO', verRolesAjenos: true }])).toBe('Administrador');
    expect(describirRoles([{ rol: 'RRHH', origen: 'ASIGNADO', verRolesAjenos: true }])).toBe('RRHH (ve roles ajenos)');
    expect(describirRoles([{ rol: 'RRHH', origen: 'ASIGNADO', verRolesAjenos: false }])).toBe('RRHH (no ve roles ajenos)');
  });

  it('junta varios roles y usa un guion si no tiene ninguno', () => {
    expect(
      describirRoles([
        { rol: 'ADMIN', origen: 'ASIGNADO', verRolesAjenos: true },
        { rol: 'RRHH', origen: 'ASIGNADO', verRolesAjenos: true },
      ]),
    ).toBe('Administrador · RRHH (ve roles ajenos)');
    expect(describirRoles([])).toBe('—');
  });
});

describe('aFilasUsuarios', () => {
  it('calcula las banderas que usan las acciones', () => {
    const [fila] = aFilasUsuarios([
      usuario('fsepa', { roles: [{ rol: 'ADMIN', origen: 'CONFIGURACION', verRolesAjenos: true }] }),
    ]);
    expect(fila).toMatchObject({ activo: true, esAdmin: true, adminDeConfiguracion: true, esRrhh: false, estadoEtiqueta: 'Activo' });
  });

  it('un RRHH sin permiso de ver roles ajenos se reconoce', () => {
    const [fila] = aFilasUsuarios([usuario('jperez', { roles: [{ rol: 'RRHH', origen: 'ASIGNADO', verRolesAjenos: false }] })]);
    expect(fila).toMatchObject({ esRrhh: true, rrhhVeAjenos: false, esAdmin: false });
  });

  it('tolera datos faltantes del directorio y a quien ya no existe', () => {
    const [fila] = aFilasUsuarios([usuario('zz.baja', { nombre: null, cargo: null, estadoDirectorio: 'NO_EXISTE' })]);
    expect(fila).toMatchObject({ nombre: '—', cargo: '—', activo: false, estadoEtiqueta: 'No existe' });
    const [dadoDeBaja] = aFilasUsuarios([usuario('zz.baja', { estadoDirectorio: 'INACTIVO' })]);
    expect(dadoDeBaja.estadoEtiqueta).toBe('De baja');
  });
});
