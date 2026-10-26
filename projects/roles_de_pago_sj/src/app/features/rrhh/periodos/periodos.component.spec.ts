import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { PeriodoResumenResponse } from '@models';
import { RrhhService } from '../rrhh.service';
import { PeriodosComponent } from './periodos.component';

const periodo = (valor: string): PeriodoResumenResponse => ({
  periodo: valor,
  estado: 'CARGADO',
  fechaPublicacion: null,
  publicadoPor: null,
  rolesActivos: 1,
});

describe('PeriodosComponent', () => {
  const servicio = { periodos: vi.fn() };
  let navegar: ReturnType<typeof vi.spyOn>;

  const crear = () => {
    const fixture = TestBed.createComponent(PeriodosComponent);
    fixture.detectChanges();
    return { componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 23));
    servicio.periodos.mockReset();
    TestBed.configureTestingModule({
      imports: [PeriodosComponent],
      providers: [provideRouter([]), { provide: RrhhService, useValue: servicio }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => vi.useRealTimers());

  it('abre el período más reciente, sin dejar esta pantalla en el historial', () => {
    servicio.periodos.mockReturnValue(of([periodo('2026-08'), periodo('2026-10'), periodo('2026-09')]));
    crear();
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos', '2026-10'], { replaceUrl: true });
  });

  it('si todavía no hay ningún período, abre el del mes actual como nuevo', () => {
    servicio.periodos.mockReturnValue(of([]));
    crear();
    expect(navegar).toHaveBeenCalledWith(['/rrhh/periodos', '2026-10'], { replaceUrl: true });
  });

  it('si no se pudo consultar, muestra el motivo y no navega', () => {
    servicio.periodos.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const { html } = crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
    expect(navegar).not.toHaveBeenCalled();
  });
});
