import { TestBed } from '@angular/core/testing';
import type { RolFila } from '../../rrhh.model';
import { MotivoCorreccionComponent } from './motivo-correccion.component';
import type { CambioConMotivo } from './motivo-correccion.model';

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

describe('MotivoCorreccionComponent', () => {
  const crear = (cambio: CambioConMotivo | null) => {
    const fixture = TestBed.createComponent(MotivoCorreccionComponent);
    fixture.componentRef.setInput('cambio', cambio);
    fixture.detectChanges();
    const confirmado = vi.fn();
    const cancelado = vi.fn();
    fixture.componentInstance.confirmado.subscribe(confirmado);
    fixture.componentInstance.cancelado.subscribe(cancelado);
    return { fixture, componente: fixture.componentInstance, confirmado, cancelado, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [MotivoCorreccionComponent] }));

  it('sin un cambio pendiente no muestra nada', () => {
    const { html } = crear(null);
    expect(html.textContent).not.toContain('Motivo');
  });

  it('al retirar un rol dice a quién y que queda en la auditoría', () => {
    const { html } = crear({ tipo: 'inactivar', rol: ROL });
    expect(html.textContent).toContain('Retirar rol');
    expect(html.textContent).toContain('Está por retirar el rol de PEREZ JUAN');
    expect(html.textContent).toContain('dejará de verlo');
    expect(html.textContent).toContain('auditoría');
  });

  it('al reponer un rol lo dice distinto y recuerda cómo avisar a quien nunca recibió su correo', () => {
    const { html } = crear({ tipo: 'activar', rol: ROL });
    expect(html.textContent).toContain('Reponer rol');
    expect(html.textContent).toContain('volverá a verlo');
    expect(html.textContent).toContain('Generar los que falten');
  });

  it('un motivo corto o vacío no se envía', () => {
    const { componente, confirmado } = crear({ tipo: 'inactivar', rol: ROL });
    componente.confirmar();
    componente.motivo.setValue('corto');
    componente.confirmar();
    expect(confirmado).not.toHaveBeenCalled();
    expect(componente.motivo.errors).toHaveProperty('minlength');
  });

  it('un motivo válido se entrega sin espacios sobrantes', () => {
    const { componente, confirmado } = crear({ tipo: 'inactivar', rol: ROL });
    componente.motivo.setValue('  Se subió a la persona equivocada  ');
    componente.confirmar();
    expect(confirmado).toHaveBeenCalledWith('Se subió a la persona equivocada');
  });

  it('un motivo de más de 200 caracteres no se envía', () => {
    const { componente, confirmado } = crear({ tipo: 'inactivar', rol: ROL });
    componente.motivo.setValue('a'.repeat(201));
    componente.confirmar();
    expect(confirmado).not.toHaveBeenCalled();
  });

  it('al pedir otro cambio el campo empieza vacío, no con el motivo anterior', () => {
    const { fixture, componente } = crear({ tipo: 'inactivar', rol: ROL });
    componente.motivo.setValue('Se subió a la persona equivocada');
    fixture.componentRef.setInput('cambio', { tipo: 'activar', rol: ROL });
    fixture.detectChanges();
    expect(componente.motivo.value).toBe('');
  });

  it('cancelar avisa y no confirma nada', () => {
    const { fixture, confirmado, cancelado } = crear({ tipo: 'inactivar', rol: ROL });
    fixture.componentInstance.cancelado.emit();
    expect(cancelado).toHaveBeenCalled();
    expect(confirmado).not.toHaveBeenCalled();
  });
});
