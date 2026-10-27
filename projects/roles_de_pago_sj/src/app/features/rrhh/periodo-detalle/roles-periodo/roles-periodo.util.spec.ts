import type { RolFila } from '../../rrhh.model';
import { accionesDeRol } from './roles-periodo.util';

const fila = (estado: RolFila['estado']): RolFila => ({
  id: 1,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado,
  estadoEtiqueta: estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
  notificacion: 'Sin notificar',
  notificacionVariante: 'neutral',
  notificacionDetalle: '',
  tamano: '2 KB',
  actualizadoEn: '22/10/2026 16:53',
});

const manejadores = { ver: vi.fn(), inactivar: vi.fn(), activar: vi.fn() };

const visibles = (publicado: boolean, puedeVerAjenos: boolean, estado: RolFila['estado']) =>
  accionesDeRol({ publicado, puedeVerAjenos }, manejadores)
    .filter((accion) => !accion.hidden?.(fila(estado)))
    .map((accion) => accion.label);

describe('accionesDeRol', () => {
  it('antes de publicar, un rol activo se puede ver (con permiso) e inactivar', () => {
    expect(visibles(false, true, 'ACTIVO')).toEqual(['Ver rol', 'Inactivar']);
  });

  it('antes de publicar, un rol inactivo se puede activar', () => {
    expect(visibles(false, true, 'INACTIVO')).toEqual(['Ver rol', 'Activar']);
  });

  it('sin el permiso de ver roles ajenos no aparece Ver rol', () => {
    expect(visibles(false, false, 'ACTIVO')).toEqual(['Inactivar']);
  });

  it('ya publicado, no se activa ni se inactiva nada: solo se puede ver', () => {
    expect(visibles(true, true, 'ACTIVO')).toEqual(['Ver rol']);
    expect(visibles(true, true, 'INACTIVO')).toEqual(['Ver rol']);
  });

  it('publicado y sin permiso no hay ninguna acción', () => {
    expect(accionesDeRol({ publicado: true, puedeVerAjenos: false }, manejadores)).toEqual([]);
  });

  it('cada acción llama a su manejador con la fila', () => {
    const acciones = accionesDeRol({ publicado: false, puedeVerAjenos: true }, manejadores);
    const [ver, inactivar, activar] = acciones;
    ver.onClick?.(fila('ACTIVO'));
    inactivar.onClick?.(fila('ACTIVO'));
    activar.onClick?.(fila('INACTIVO'));
    expect(manejadores.ver).toHaveBeenCalledWith(fila('ACTIVO'));
    expect(manejadores.inactivar).toHaveBeenCalledWith(fila('ACTIVO'));
    expect(manejadores.activar).toHaveBeenCalledWith(fila('INACTIVO'));
  });
});
