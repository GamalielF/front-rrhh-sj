import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { MiRolPagoService } from '../../mi-rol-pago';
import { RolRecienteComponent } from './rol-reciente.component';

describe('RolRecienteComponent', () => {
  const servicio = { periodos: vi.fn() };
  let navegar: ReturnType<typeof vi.spyOn>;

  const crear = () => {
    const fixture = TestBed.createComponent(RolRecienteComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.periodos.mockReset();
    TestBed.configureTestingModule({
      imports: [RolRecienteComponent],
      providers: [provideRouter([]), { provide: MiRolPagoService, useValue: servicio }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  it('muestra el último mes publicado y cuántos hay disponibles', () => {
    servicio.periodos.mockReturnValue(of(['2026-10', '2026-09', '2026-08']));
    const { html } = crear();
    expect(html.textContent).toContain('Octubre 2026');
    expect(html.textContent).toContain('3 meses disponibles');
    expect(html.textContent).toContain('se le pedirá su número de cédula');
  });

  it('con un solo mes habla en singular', () => {
    servicio.periodos.mockReturnValue(of(['2026-10']));
    expect(crear().html.textContent).toContain('1 mes disponible');
  });

  it('el botón abre Mi rol de pago con ese mes ya elegido', () => {
    servicio.periodos.mockReturnValue(of(['2026-10', '2026-09']));
    const { componente } = crear();
    componente.abrir();
    expect(navegar).toHaveBeenCalledWith(['/mi-rol'], { queryParams: { periodo: '2026-10' } });
  });

  it('sin roles publicados lo dice y no ofrece el botón', () => {
    servicio.periodos.mockReturnValue(of([]));
    const { html } = crear();
    expect(html.textContent).toContain('Todavía no hay roles de pago publicados');
    expect(html.textContent).not.toContain('Ver mi rol de pago');
  });

  it('si no se pudo consultar muestra el motivo', () => {
    servicio.periodos.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    expect(crear().html.textContent).toContain('No hay conexión con el servidor');
  });
});
