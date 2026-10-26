import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DirectorioService } from '../directorio.service';
import { BuscadorCedulaComponent } from './buscador-cedula.component';

describe('BuscadorCedulaComponent', () => {
  const servicio = { buscarPorCedula: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(BuscadorCedulaComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.buscarPorCedula.mockReset();
    TestBed.configureTestingModule({
      imports: [BuscadorCedulaComponent],
      providers: [{ provide: DirectorioService, useValue: servicio }],
    });
  });

  it('no busca si la cédula no tiene 10 dígitos', () => {
    const { componente } = crear();
    componente.buscar();
    componente.formulario.controls.cedula.setValue('12345');
    componente.buscar();
    expect(servicio.buscarPorCedula).not.toHaveBeenCalled();
  });

  it('muestra las cuentas encontradas con la cédula completa', () => {
    servicio.buscarPorCedula.mockReturnValue(
      of([
        { username: 'jperez', nombreCompleto: 'PEREZ LOPEZ JUAN', cargo: 'ANALISTA', email: 'jperez@x.ec', estado: 'ACTIVO', cedula: '1712345675' },
        { username: 'jperez2', nombreCompleto: 'PEREZ LOPEZ JUAN', cargo: 'ANALISTA', email: null, estado: 'INACTIVO', cedula: '1712345675' },
      ]),
    );
    const { fixture, componente, html } = crear();
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.buscar();
    fixture.detectChanges();
    expect(servicio.buscarPorCedula).toHaveBeenCalledWith('1712345675');
    expect(html.textContent).toContain('jperez2');
    expect(html.textContent).toContain('1712345675');
    expect(html.textContent).toContain('De baja');
  });

  it('sin coincidencias lo dice, y no antes de buscar', () => {
    servicio.buscarPorCedula.mockReturnValue(of([]));
    const { fixture, componente, html } = crear();
    expect(html.textContent).not.toContain('No hay ninguna cuenta');
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.buscar();
    fixture.detectChanges();
    expect(html.textContent).toContain('No hay ninguna cuenta con esa cédula');
  });

  it('si el AD no responde muestra el motivo y no deja resultados viejos', () => {
    servicio.buscarPorCedula
      .mockReturnValueOnce(of([{ username: 'jperez', nombreCompleto: 'X', cargo: null, email: null, estado: 'ACTIVO', cedula: '1712345675' }]))
      .mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 502, error: { message: 'El AD no está disponible' } })));
    const { fixture, componente, html } = crear();
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.buscar();
    componente.buscar();
    fixture.detectChanges();
    expect(html.textContent).toContain('El AD no está disponible');
    expect(componente.resultados()).toEqual([]);
  });
});
