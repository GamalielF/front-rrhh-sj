import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuditoriaService } from '../auditoria.service';
import { accion, filtros, pagina } from '../auditoria.testing';
import { PanelAccionesComponent } from './panel-acciones.component';

describe('PanelAccionesComponent', () => {
  const servicio = { acciones: vi.fn() };

  const crear = (f = filtros()) => {
    const fixture = TestBed.createComponent(PanelAccionesComponent);
    fixture.componentRef.setInput('filtros', f);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.acciones.mockReset().mockReturnValue(of(pagina([accion(), accion({ id: 2, tipoAccion: 'USUARIO_ROL_OTORGADO', periodo: null })], 30)));
    TestBed.configureTestingModule({
      imports: [PanelAccionesComponent],
      providers: [{ provide: AuditoriaService, useValue: servicio }],
    });
  });

  it('carga la primera página y muestra las acciones en español', () => {
    const { componente, html } = crear(filtros({ tipoAccion: 'CARGA_LOTE' }));
    expect(servicio.acciones).toHaveBeenCalledWith(expect.objectContaining({ tipoAccion: 'CARGA_LOTE' }), 0, 20);
    expect(componente.total()).toBe(30);
    expect(html.textContent).toContain('Período publicado');
    expect(html.textContent).toContain('Rol otorgado a un usuario');
  });

  it('al cambiar los filtros o la página vuelve a consultar', () => {
    const { fixture, componente } = crear();
    componente.cambiarPagina(1);
    expect(servicio.acciones).toHaveBeenLastCalledWith(expect.anything(), 1, 20);
    fixture.componentRef.setInput('filtros', filtros({ usuario: 'fsepa' }));
    fixture.detectChanges();
    expect(servicio.acciones).toHaveBeenLastCalledWith(expect.objectContaining({ usuario: 'fsepa' }), 0, 20);
  });

  it('si falla muestra el motivo', () => {
    servicio.acciones.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'No tiene permiso' } })));
    const { html } = crear();
    expect(html.textContent).toContain('No tiene permiso');
  });
});
