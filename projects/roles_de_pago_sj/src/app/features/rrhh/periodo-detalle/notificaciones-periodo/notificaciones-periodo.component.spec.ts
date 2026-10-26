import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import type { InformeNotificacionesResponse } from '@models';
import { NotificacionesPeriodoComponent } from './notificaciones-periodo.component';
import { INTERVALO_ACTUALIZACION_MS } from './notificaciones-periodo.model';
import { NotificacionesService } from './notificaciones-periodo.service';

const informe = (cambios: Partial<InformeNotificacionesResponse> = {}): InformeNotificacionesResponse => ({
  periodo: '2026-09',
  habilitadas: true,
  total: 10,
  pendientes: 0,
  reintentando: 0,
  enviadas: 10,
  fallidas: 0,
  omitidas: 0,
  problemas: [],
  ...cambios,
});

describe('NotificacionesPeriodoComponent', () => {
  const servicio = { informe: vi.fn(), generar: vi.fn(), reintentar: vi.fn() };

  const crear = () => {
    const fixture = TestBed.createComponent(NotificacionesPeriodoComponent);
    fixture.componentRef.setInput('periodo', '2026-09');
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    servicio.informe.mockReset().mockReturnValue(of(informe()));
    servicio.generar.mockReset();
    servicio.reintentar.mockReset();
    TestBed.configureTestingModule({
      imports: [NotificacionesPeriodoComponent],
      providers: [{ provide: NotificacionesService, useValue: servicio }],
    });
  });

  afterEach(() => vi.useRealTimers());

  it('muestra el estado de los avisos al abrir', () => {
    const { html } = crear();
    expect(servicio.informe).toHaveBeenCalledWith('2026-09');
    expect(html.textContent).toContain('10 enviados');
    expect(html.textContent).not.toContain('Reintentar fallidos');
  });

  it('lista las personas con problemas y ofrece reintentar solo si hay fallidos', () => {
    servicio.informe.mockReturnValue(
      of(
        informe({
          fallidas: 1,
          omitidas: 1,
          problemas: [
            { nombre: 'PEREZ JUAN', estado: 'FALLIDA', intentos: 5, error: 'La API de correo no respondió a tiempo' },
            { nombre: 'GARCIA ANA', estado: 'OMITIDA', intentos: 0, error: null },
          ],
        }),
      ),
    );
    const { html } = crear();
    expect(html.textContent).toContain('PEREZ JUAN');
    expect(html.textContent).toContain('Sin cuenta activa con correo');
    expect(html.textContent).toContain('Reintentar fallidos');
  });

  it('si los avisos están deshabilitados lo dice y no ofrece enviar nada', () => {
    servicio.informe.mockReturnValue(of(informe({ habilitadas: false })));
    const { html } = crear();
    expect(html.textContent).toContain('deshabilitados en este entorno');
    expect(html.textContent).not.toContain('Generar los que falten');
  });

  it('mientras haya pendientes se actualiza solo cada 10 segundos, y se detiene al terminar', () => {
    servicio.informe.mockReturnValueOnce(of(informe({ pendientes: 3 }))).mockReturnValue(of(informe()));
    crear();
    expect(servicio.informe).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(INTERVALO_ACTUALIZACION_MS);
    expect(servicio.informe).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(INTERVALO_ACTUALIZACION_MS * 3);
    expect(servicio.informe).toHaveBeenCalledTimes(2);
  });

  it('al cerrar la pantalla deja de consultar', () => {
    servicio.informe.mockReturnValue(of(informe({ pendientes: 3 })));
    const { fixture } = crear();
    fixture.destroy();
    vi.advanceTimersByTime(INTERVALO_ACTUALIZACION_MS * 3);
    expect(servicio.informe).toHaveBeenCalledTimes(1);
  });

  it('reintentar devuelve los fallidos a la cola, lo cuenta y vuelve a consultar', () => {
    servicio.informe.mockReturnValue(of(informe({ fallidas: 2 })));
    servicio.reintentar.mockReturnValue(of({ reintentadas: 2 }));
    const { fixture, componente, html } = crear();
    componente.reintentar();
    fixture.detectChanges();
    expect(html.textContent).toContain('Se devolvieron 2 avisos a la cola');
    expect(servicio.informe).toHaveBeenCalledTimes(2);
  });

  it('generar cuenta los avisos nuevos', () => {
    servicio.generar.mockReturnValue(of({ creadas: 4, pendientes: 4, omitidas: 1, yaExistentes: 6 }));
    const { fixture, componente, html } = crear();
    componente.generar();
    fixture.detectChanges();
    expect(html.textContent).toContain('Avisos nuevos: 4. Ya existían 6; sin correo, 1.');
  });

  it('si el servidor rechaza una operación muestra su motivo', () => {
    servicio.reintentar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'Los avisos por correo están deshabilitados' } })),
    );
    const { fixture, componente, html } = crear();
    componente.reintentar();
    fixture.detectChanges();
    expect(html.textContent).toContain('Los avisos por correo están deshabilitados');
  });
});
