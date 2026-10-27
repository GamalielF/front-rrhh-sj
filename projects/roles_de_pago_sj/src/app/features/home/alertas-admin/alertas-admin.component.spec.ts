import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AlertasAdminComponent } from './alertas-admin.component';
import { AlertasAdminService } from './alertas-admin.service';

describe('AlertasAdminComponent', () => {
  const servicio = { cargar: vi.fn() };
  let navegar: ReturnType<typeof vi.spyOn>;

  const crear = () => {
    const fixture = TestBed.createComponent(AlertasAdminComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.cargar.mockReset();
    TestBed.configureTestingModule({
      imports: [AlertasAdminComponent],
      providers: [provideRouter([]), { provide: AlertasAdminService, useValue: servicio }],
    });
    navegar = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  });

  it('muestra cada alerta con su mensaje y un botón para revisarla', () => {
    servicio.cargar.mockReturnValue(
      of({
        alertas: [
          { variante: 'danger', mensaje: 'La última sincronización del directorio falló.', ruta: '/admin/directorio' },
          { variante: 'warning', mensaje: '1 usuario tiene 3 o más intentos denegados', ruta: '/admin/auditoria' },
        ],
        incompleto: false,
      }),
    );
    const { componente, html } = crear();
    expect(html.textContent).toContain('La última sincronización del directorio falló.');
    expect(html.textContent).toContain('1 usuario tiene 3 o más intentos denegados');
    expect(html.textContent).not.toContain('Sin alertas');
    componente.abrir('/admin/auditoria');
    expect(navegar).toHaveBeenCalledWith('/admin/auditoria');
  });

  it('sin problemas lo dice en positivo', () => {
    servicio.cargar.mockReturnValue(of({ alertas: [], incompleto: false }));
    expect(crear().html.textContent).toContain('Sin alertas');
  });

  it('si no se pudo comprobar todo, no afirma que todo está bien', () => {
    servicio.cargar.mockReturnValue(of({ alertas: [], incompleto: true }));
    const { html } = crear();
    expect(html.textContent).toContain('No se pudieron comprobar todas las alertas');
    expect(html.textContent).not.toContain('Sin alertas');
  });

  it('si falla la consulta muestra el motivo y tampoco dice que todo está bien', () => {
    servicio.cargar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'No tiene permiso' } })));
    const { html } = crear();
    expect(html.textContent).toContain('No tiene permiso');
    expect(html.textContent).not.toContain('Sin alertas');
  });
});
