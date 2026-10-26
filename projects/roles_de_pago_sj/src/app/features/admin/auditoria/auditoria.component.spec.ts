import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuditoriaComponent } from './auditoria.component';
import { AuditoriaService } from './auditoria.service';
import { filtros, pagina } from './auditoria.testing';

describe('AuditoriaComponent', () => {
  const servicio = { accesos: vi.fn(), acciones: vi.fn(), denegados: vi.fn(), exportarAccesos: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(AuditoriaComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.accesos.mockReset().mockReturnValue(of(pagina([])));
    servicio.acciones.mockReset().mockReturnValue(of(pagina([])));
    servicio.denegados.mockReset().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [AuditoriaComponent],
      providers: [{ provide: AuditoriaService, useValue: servicio }],
    });
  });

  it('empieza mostrando los accesos a roles, y solo esos', () => {
    const { html } = crear();
    expect(html.textContent).toContain('Accesos a roles de pago');
    expect(html.textContent).not.toContain('Cargas, publicaciones, avisos y cambios de roles');
    expect(html.textContent).not.toContain('Quién tecleó cédulas que no eran suyas');
    expect(servicio.accesos).toHaveBeenCalledTimes(1);
    expect(servicio.acciones).not.toHaveBeenCalled();
    expect(servicio.denegados).not.toHaveBeenCalled();
  });

  it('cada botón cambia el panel que se muestra', () => {
    const { fixture, componente, html } = crear();
    componente.cambiarModo('acciones');
    fixture.detectChanges();
    expect(html.textContent).toContain('Cargas, publicaciones, avisos y cambios de roles');
    expect(servicio.acciones).toHaveBeenCalledTimes(1);
    componente.cambiarModo('denegados');
    fixture.detectChanges();
    expect(html.textContent).toContain('Quién tecleó cédulas que no eran suyas');
    expect(servicio.denegados).toHaveBeenCalledTimes(1);
  });

  it('los filtros que se aplican llegan al panel activo', () => {
    const { fixture, componente } = crear();
    servicio.accesos.mockClear();
    componente.filtros.set(filtros({ usuario: 'jperez' }));
    fixture.detectChanges();
    expect(servicio.accesos).toHaveBeenCalledWith(expect.objectContaining({ usuario: 'jperez' }), 0, 20);
  });

  it('al cambiar de vista se descartan las opciones de la anterior pero se conservan fechas y usuario', () => {
    const { componente } = crear();
    componente.filtros.set(filtros({ usuario: 'jperez', desde: '2026-10-01', resultado: 'DENEGADO', tipoAcceso: 'CONSULTA_AJENA' }));
    componente.cambiarModo('acciones');
    expect(componente.filtros()).toMatchObject({ usuario: 'jperez', desde: '2026-10-01', resultado: '', tipoAcceso: '' });
  });

  it('volver a pulsar la vista actual no recarga nada', () => {
    const { fixture, componente } = crear();
    servicio.accesos.mockClear();
    componente.cambiarModo('accesos');
    fixture.detectChanges();
    expect(servicio.accesos).not.toHaveBeenCalled();
  });
});
