import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { EstadoDirectorioResponse } from '@models';
import { DirectorioComponent } from './directorio.component';
import { DirectorioService } from './directorio.service';

const estado = (cambios: Partial<EstadoDirectorioResponse> = {}): EstadoDirectorioResponse => ({
  activos: 312,
  inactivos: 14,
  ultimaSincronizacion: '2026-10-26T08:30:00',
  resultadoUltima: 'EXITOSA',
  mensajeUltima: null,
  ...cambios,
});

const sincronizacion = {
  recibidos: 326,
  creados: 2,
  actualizados: 5,
  sinCambios: 318,
  inactivados: 1,
  omitidos: 0,
  cedulasConDigitoInvalido: 0,
  inicio: '2026-10-26T10:00:00',
  fin: '2026-10-26T10:00:08',
};

describe('DirectorioComponent', () => {
  const servicio = { estado: vi.fn(), sincronizar: vi.fn(), buscarPorCedula: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(DirectorioComponent);
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.estado.mockReset().mockReturnValue(of(estado()));
    servicio.sincronizar.mockReset();
    servicio.buscarPorCedula.mockReset();
    TestBed.configureTestingModule({
      imports: [DirectorioComponent],
      providers: [{ provide: DirectorioService, useValue: servicio }],
    });
  });

  it('muestra cuántas personas hay, cuándo se sincronizó por última vez y cómo salió', () => {
    const { html } = crear();
    expect(html.textContent).toContain('312');
    expect(html.textContent).toContain('26/10/2026 08:30');
    expect(html.textContent).toContain('Exitosa');
  });

  it('si nunca se sincronizó lo dice', () => {
    servicio.estado.mockReturnValue(of(estado({ ultimaSincronizacion: null, resultadoUltima: null })));
    const { html } = crear();
    expect(html.textContent).toContain('Nunca');
  });

  it('si la última sincronización falló explica el motivo', () => {
    servicio.estado.mockReturnValue(of(estado({ resultadoUltima: 'FALLIDA', mensajeUltima: 'El AD no respondió' })));
    const { html } = crear();
    expect(html.textContent).toContain('La última sincronización falló: El AD no respondió');
  });

  it('sincronizar muestra el resultado y vuelve a pedir el estado', () => {
    servicio.sincronizar.mockReturnValue(of(sincronizacion));
    const { fixture, componente, html } = crear();
    componente.sincronizar();
    fixture.detectChanges();
    expect(html.textContent).toContain('326 recibidos del AD');
    expect(html.textContent).toContain('2 nuevos');
    expect(servicio.estado).toHaveBeenCalledTimes(2);
    expect(componente.sincronizando()).toBe(false);
  });

  it('si la sincronización falla muestra el motivo y no deja el botón trabado', () => {
    servicio.sincronizar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 502, error: { message: 'El servicio del directorio no está disponible' } })),
    );
    const { fixture, componente, html } = crear();
    componente.sincronizar();
    fixture.detectChanges();
    expect(html.textContent).toContain('El servicio del directorio no está disponible');
    expect(componente.sincronizando()).toBe(false);
  });
});
