import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { RolPagoPdfResponse } from '@models';
import type { RolFila } from '../../rrhh.model';
import { RrhhService } from '../../rrhh.service';
import { VerRolComponent } from './ver-rol.component';

const ROL: RolFila = {
  id: 5,
  cedula: '1712345675',
  nombre: 'PEREZ JUAN',
  estado: 'ACTIVO',
  estadoEtiqueta: 'Activo',
  notificacion: 'Sin notificar',
  notificacionVariante: 'neutral',
  notificacionDetalle: '',
  notificacionDetalleCorto: '',
  grupoNotificacion: 'SIN_AVISO',
  reenviable: true,
  tamano: '2 KB',
  actualizadoEn: '22/10/2026 16:53',
};

const PDF: RolPagoPdfResponse = {
  periodo: '2026-09',
  nombreArchivo: '1712345675.pdf',
  tipoContenido: 'application/pdf',
  tamanoBytes: 5,
  contenidoBase64: 'JVBERi0=',
};

describe('VerRolComponent', () => {
  const servicio = { verRol: vi.fn() };

  const crear = (rol: RolFila | null = ROL) => {
    const fixture = TestBed.createComponent(VerRolComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.componentRef.setInput('rol', rol);
    fixture.detectChanges();
    const cerrado = vi.fn();
    fixture.componentInstance.cerrado.subscribe(cerrado);
    return { fixture, componente: fixture.componentInstance, cerrado, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.verRol.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:rol');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({
      imports: [VerRolComponent],
      providers: [{ provide: RrhhService, useValue: servicio }],
    });
  });

  it('sin un rol elegido no muestra nada', () => {
    const { html } = crear(null);
    expect(html.textContent).not.toContain('Motivo de la consulta');
  });

  it('con un rol elegido pide el motivo y avisa que queda auditado', () => {
    const { html } = crear();
    expect(html.textContent).toContain('PEREZ JUAN');
    expect(html.textContent).toContain('Motivo de la consulta');
    expect(html.textContent).toContain('queda registrado en la auditoría');
  });

  it('un motivo demasiado corto o vacío no llega al servidor', () => {
    const { componente } = crear();
    componente.consultar();
    componente.motivo.setValue('corto');
    componente.consultar();
    expect(servicio.verRol).not.toHaveBeenCalled();
    expect(componente.motivo.errors).toHaveProperty('minlength');
  });

  it('con un motivo válido pide el rol, lo muestra en el visor y no repite la pregunta', () => {
    servicio.verRol.mockReturnValue(of(PDF));
    const { fixture, componente, html } = crear();
    componente.motivo.setValue('  Revisión solicitada por el empleado  ');
    componente.consultar();
    fixture.detectChanges();
    expect(servicio.verRol).toHaveBeenCalledWith('2026-09', 5, 'Revisión solicitada por el empleado');
    expect(componente.pdf()).toEqual(PDF);
    expect(html.querySelector('app-visor-pdf iframe')).not.toBeNull();
    expect(html.textContent).not.toContain('Descargar PDF');
    expect(html.textContent).not.toContain('Motivo de la consulta');
  });

  it('si el servidor lo rechaza (sin permiso, por ejemplo) muestra su mensaje y conserva el motivo', () => {
    servicio.verRol.mockReturnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 403,
            error: { message: 'No tiene permiso para consultar roles de pago de otras personas' },
          }),
      ),
    );
    const { fixture, componente, html } = crear();
    componente.motivo.setValue('Revisión solicitada por el empleado');
    componente.consultar();
    fixture.detectChanges();
    expect(html.textContent).toContain('No tiene permiso para consultar roles de pago de otras personas');
    expect(componente.pdf()).toBeNull();
    expect(componente.motivo.value).toBe('Revisión solicitada por el empleado');
  });

  it('al elegir otro rol se descarta el PDF y el motivo anteriores', () => {
    servicio.verRol.mockReturnValue(of(PDF));
    const { fixture, componente } = crear();
    componente.motivo.setValue('Revisión solicitada por el empleado');
    componente.consultar();
    fixture.componentRef.setInput('rol', { ...ROL, id: 6, nombre: 'GARCIA ANA' });
    fixture.detectChanges();
    expect(componente.pdf()).toBeNull();
    expect(componente.motivo.value).toBe('');
  });

  it('cerrar avisa a la página', () => {
    const { componente, cerrado } = crear();
    componente.cerrar();
    expect(cerrado).toHaveBeenCalledTimes(1);
  });
});
