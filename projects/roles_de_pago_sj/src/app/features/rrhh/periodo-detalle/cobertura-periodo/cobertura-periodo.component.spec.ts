import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RrhhService } from '../../rrhh.service';
import { CoberturaPeriodoComponent } from './cobertura-periodo.component';

describe('CoberturaPeriodoComponent', () => {
  const servicio = { cobertura: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(CoberturaPeriodoComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.cobertura.mockReset();
    TestBed.configureTestingModule({
      imports: [CoberturaPeriodoComponent],
      providers: [{ provide: RrhhService, useValue: servicio }],
    });
  });

  it('muestra cuántos abrieron su rol, el porcentaje y quiénes faltan', () => {
    servicio.cobertura.mockReturnValue(
      of({ periodo: '2026-09', rolesPublicados: 4, leidos: 3, pendientes: 1, nombresPendientes: ['GARCIA ANA'] }),
    );
    const { html } = crear();
    expect(servicio.cobertura).toHaveBeenCalledWith('2026-09');
    expect(html.textContent).toContain('3 (75%)');
    expect(html.textContent).toContain('GARCIA ANA');
  });

  it('cuando todos lo abrieron no lista pendientes', () => {
    servicio.cobertura.mockReturnValue(
      of({ periodo: '2026-09', rolesPublicados: 2, leidos: 2, pendientes: 0, nombresPendientes: [] }),
    );
    const { html } = crear();
    expect(html.textContent).not.toContain('Pendientes:');
  });

  it('muestra el motivo si no se pudo consultar', () => {
    servicio.cobertura.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'El período 2026-09 aún no está publicado' } })),
    );
    const { html } = crear();
    expect(html.textContent).toContain('aún no está publicado');
  });
});
