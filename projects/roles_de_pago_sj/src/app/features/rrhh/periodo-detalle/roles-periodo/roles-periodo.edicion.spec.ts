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
  notificacionDetalleCorto: '',
  grupoNotificacion: 'SIN_AVISO',
  reenviable: true,
  tamano: '2 KB',
  actualizadoEn: '22/10/2026 16:53',
});

const manejadores = { ver: vi.fn(), inactivar: vi.fn(), activar: vi.fn(), reenviar: vi.fn() };

const visibles = (publicado: boolean, editando: boolean | undefined, estado: RolFila['estado']) =>
  accionesDeRol({ publicado, puedeVerAjenos: false, editando }, manejadores)
    .filter((accion) => !accion.hidden?.(fila(estado)))
    .map((accion) => accion.label);

describe('accionesDeRol: editar un período publicado', () => {
  it('publicado y sin editar, retirar y reponer siguen bloqueados', () => {
    expect(visibles(true, false, 'ACTIVO')).toEqual(['Reenviar notificación']);
    expect(visibles(true, undefined, 'INACTIVO')).toEqual([]);
  });

  it('publicado y editando, un rol activo se puede retirar (y se sigue pudiendo reenviar su aviso)', () => {
    expect(visibles(true, true, 'ACTIVO')).toEqual(['Reenviar notificación', 'Inactivar']);
  });

  it('publicado y editando, un rol retirado se puede reponer', () => {
    expect(visibles(true, true, 'INACTIVO')).toEqual(['Activar']);
  });

  it('antes de publicar no cambia nada: editar no aplica', () => {
    expect(visibles(false, false, 'ACTIVO')).toEqual(['Inactivar']);
    expect(visibles(false, true, 'ACTIVO')).toEqual(['Inactivar']);
  });
});
