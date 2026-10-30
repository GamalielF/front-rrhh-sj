import { botonReintentar } from '../../../../shared/components/error-carga/error-carga.testing';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuditoriaService } from '../auditoria.service';
import { filtros } from '../auditoria.testing';
import { PanelDenegadosComponent } from './panel-denegados.component';

describe('PanelDenegadosComponent', () => {
  const servicio = { denegados: vi.fn() };

  const crear = (f = filtros()) => {
    const fixture = TestBed.createComponent(PanelDenegadosComponent);
    fixture.componentRef.setInput('filtros', f);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.denegados.mockReset().mockReturnValue(
      of([{ usuario: 'jperez', intentos: 6, cedulasDistintas: 5, ultimoIntento: '2026-10-26T10:00:00' }]),
    );
    TestBed.configureTestingModule({
      imports: [PanelDenegadosComponent],
      providers: [{ provide: AuditoriaService, useValue: servicio }],
    });
  });

  it('lista quién tecleó cédulas ajenas, cuántas distintas y cuándo fue la última vez', () => {
    const { html } = crear(filtros({ minimo: 3 }));
    expect(servicio.denegados).toHaveBeenCalledWith(expect.objectContaining({ minimo: 3 }));
    expect(html.textContent).toContain('jperez');
    expect(html.textContent).toContain('26/10/2026 10:00');
  });

  it('sin nadie sobre el mínimo lo dice', () => {
    servicio.denegados.mockReturnValue(of([]));
    const { html } = crear();
    expect(html.textContent).toContain('Nadie alcanzó el mínimo');
  });

  it('al cambiar los filtros vuelve a consultar', () => {
    const { fixture } = crear();
    fixture.componentRef.setInput('filtros', filtros({ minimo: 10 }));
    fixture.detectChanges();
    expect(servicio.denegados).toHaveBeenLastCalledWith(expect.objectContaining({ minimo: 10 }));
  });

  it('si falla muestra el motivo', () => {
    servicio.denegados.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
  });

  it('si falla la consulta ofrece volver a cargar, y al pulsarlo la repite con los mismos filtros', () => {
    servicio.denegados.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { fixture, html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
    botonReintentar(html)?.click();
    fixture.detectChanges();
    expect(servicio.denegados).toHaveBeenCalledTimes(2);
    expect(html.textContent).not.toContain('No hay conexión con el servidor');
    expect(botonReintentar(html)).toBeUndefined();
  });
});
