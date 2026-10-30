import type { RolFila } from '../../rrhh.model';
import { accionesDeRol } from './roles-periodo.util';

const fila = (estado: RolFila['estado'], reenviable = true): RolFila => ({
  id: 1,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado,
  estadoEtiqueta: estado === 'ACTIVO' ? 'Activo' : 'Inactivo',
  notificacion: 'Sin notificar',
  notificacionVariante: 'neutral',
  notificacionDetalle: '',
  notificacionDetalleCorto: '',
  grupoNotificacion: 'SIN_AVISO',
  reenviable,
  tamano: '2 KB',
  actualizadoEn: '22/10/2026 16:53',
});

const manejadores = { ver: vi.fn(), inactivar: vi.fn(), activar: vi.fn(), reenviar: vi.fn() };

const visibles = (publicado: boolean, puedeVerAjenos: boolean, estado: RolFila['estado'], reenviable = true) =>
  accionesDeRol({ publicado, puedeVerAjenos }, manejadores)
    .filter((accion) => !accion.hidden?.(fila(estado, reenviable)))
    .map((accion) => accion.label);

describe('accionesDeRol', () => {
  it('antes de publicar, un rol activo se puede ver (con permiso) e inactivar, y todavía no hay aviso que reenviar', () => {
    expect(visibles(false, true, 'ACTIVO')).toEqual(['Ver rol', 'Inactivar']);
  });

  it('antes de publicar, un rol inactivo se puede activar', () => {
    expect(visibles(false, true, 'INACTIVO')).toEqual(['Ver rol', 'Activar']);
  });

  it('sin el permiso de ver roles ajenos no aparece Ver rol', () => {
    expect(visibles(false, false, 'ACTIVO')).toEqual(['Inactivar']);
  });

  it('ya publicado, un rol activo se puede ver y reenviar su notificación, pero no inactivar', () => {
    expect(visibles(true, true, 'ACTIVO')).toEqual(['Ver rol', 'Reenviar notificación']);
  });

  it('ya publicado, un rol inactivo no tiene aviso que reenviar', () => {
    expect(visibles(true, true, 'INACTIVO')).toEqual(['Ver rol']);
  });

  it('un aviso que está en cola de envío no se puede reenviar todavía', () => {
    expect(visibles(true, true, 'ACTIVO', false)).toEqual(['Ver rol']);
  });

  it('publicado y sin permiso de ver roles ajenos, RRHH igual puede reenviar la notificación', () => {
    expect(visibles(true, false, 'ACTIVO')).toEqual(['Reenviar notificación']);
  });

  it('cada acción llama a su manejador con la fila', () => {
    const [ver, reenviar, inactivar, activar] = accionesDeRol({ publicado: false, puedeVerAjenos: true }, manejadores);
    ver.onClick?.(fila('ACTIVO'));
    reenviar.onClick?.(fila('ACTIVO'));
    inactivar.onClick?.(fila('ACTIVO'));
    activar.onClick?.(fila('INACTIVO'));
    expect(manejadores.ver).toHaveBeenCalledWith(fila('ACTIVO'));
    expect(manejadores.reenviar).toHaveBeenCalledWith(fila('ACTIVO'));
    expect(manejadores.inactivar).toHaveBeenCalledWith(fila('ACTIVO'));
    expect(manejadores.activar).toHaveBeenCalledWith(fila('INACTIVO'));
  });
});
