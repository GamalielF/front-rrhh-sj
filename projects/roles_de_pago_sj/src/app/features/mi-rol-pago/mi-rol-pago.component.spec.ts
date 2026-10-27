import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { AuthService, UserSession } from '@lumen/auth';
import type { RolPagoPdfResponse } from '@models';
import { MiRolPagoComponent } from './mi-rol-pago.component';
import { MiRolPagoService } from './mi-rol-pago.service';

const PDF: RolPagoPdfResponse = {
  periodo: '2026-09',
  nombreArchivo: '1712345675.pdf',
  tipoContenido: 'application/pdf',
  tamanoBytes: 5,
  contenidoBase64: 'JVBERi0=',
};

describe('MiRolPagoComponent', () => {
  const sesion$ = new BehaviorSubject<UserSession | null>(null);
  const servicio = { periodos: vi.fn(), consultar: vi.fn() };

  const crear = async () => {
    const fixture = TestBed.createComponent(MiRolPagoComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, componente: fixture.componentInstance, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    servicio.periodos.mockReturnValue(of(['2026-09', '2026-08']));
    servicio.consultar.mockReset();
    URL.createObjectURL = vi.fn(() => 'blob:rol');
    URL.revokeObjectURL = vi.fn();
    sesion$.next({ username: 'jperez', id: '1712345675' });
    TestBed.configureTestingModule({
      imports: [MiRolPagoComponent],
      providers: [
        provideRouter([]),
        { provide: MiRolPagoService, useValue: servicio },
        { provide: AuthService, useValue: { user$: sesion$ } },
      ],
    });
  });

  it('ofrece los períodos publicados, deja elegido el más reciente y muestra la pista de la cédula', async () => {
    const { componente, html } = await crear();
    expect(componente.periodoSeleccionado()).toBe('2026-09');
    expect(html.textContent).toContain('Septiembre 2026');
    expect(html.textContent).toContain('Agosto 2026');
    expect(html.textContent).toContain('17******75');
  });

  it('sin roles publicados lo dice', async () => {
    servicio.periodos.mockReturnValue(of([]));
    const { html } = await crear();
    expect(html.textContent).toContain('Todavía no hay roles de pago publicados');
  });

  it('si no se pudieron cargar los períodos muestra el motivo', async () => {
    servicio.periodos.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 0, error: new ProgressEvent('error') })),
    );
    const { html } = await crear();
    expect(html.textContent).toContain('No hay conexión con el servidor');
  });

  it('una cédula distinta de la de la cuenta ni siquiera llega al servidor', async () => {
    const { componente } = await crear();
    componente.formulario.controls.cedula.setValue('1812345675');
    componente.consultar();
    expect(servicio.consultar).not.toHaveBeenCalled();
    expect(componente.formulario.controls.cedula.errors).toEqual({ cedulaNoCoincide: true });
  });

  it('si la sesión no conoce la cédula, la decisión es del servidor', async () => {
    sesion$.next({ username: 'jperez' });
    servicio.consultar.mockReturnValue(of(PDF));
    const { componente } = await crear();
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.consultar();
    expect(servicio.consultar).toHaveBeenCalledTimes(1);
  });

  it('una consulta correcta muestra el visor con el rol del período elegido', async () => {
    servicio.consultar.mockReturnValue(of(PDF));
    const { fixture, componente, html } = await crear();
    componente.seleccionar('2026-08');
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.consultar();
    fixture.detectChanges();
    expect(servicio.consultar).toHaveBeenCalledWith({ cedula: '1712345675', periodo: '2026-08' });
    expect(html.querySelector('app-visor-pdf iframe')).not.toBeNull();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('un rechazo del servidor muestra su mensaje y no deja ningún rol visible', async () => {
    servicio.consultar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'La cédula no corresponde a su cuenta' } })),
    );
    const { fixture, componente, html } = await crear();
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.consultar();
    fixture.detectChanges();
    expect(componente.error()).toBe('La cédula no corresponde a su cuenta');
    expect(componente.rol()).toBeNull();
    expect(html.textContent).toContain('La cédula no corresponde a su cuenta');
    expect(componente.bloqueado()).toBe(false);
  });

  it('con demasiados intentos (429) bloquea el formulario y no vuelve a llamar al servidor', async () => {
    servicio.consultar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 429, error: { message: 'Demasiados intentos fallidos' } })),
    );
    const { componente } = await crear();
    componente.formulario.controls.cedula.setValue('1712345675');
    componente.consultar();
    expect(componente.bloqueado()).toBe(true);
    componente.consultar();
    expect(servicio.consultar).toHaveBeenCalledTimes(1);
  });

  it('abre el mes que pide la dirección (?periodo=) si está publicado', async () => {
    const ruta = TestBed.inject(ActivatedRoute);
    Object.defineProperty(ruta.snapshot, 'queryParamMap', { value: convertToParamMap({ periodo: '2026-08' }), configurable: true });
    const { componente } = await crear();
    expect(componente.periodoSeleccionado()).toBe('2026-08');
  });

  it('si el mes pedido no está publicado, deja el más reciente', async () => {
    const ruta = TestBed.inject(ActivatedRoute);
    Object.defineProperty(ruta.snapshot, 'queryParamMap', { value: convertToParamMap({ periodo: '2020-01' }), configurable: true });
    const { componente } = await crear();
    expect(componente.periodoSeleccionado()).toBe('2026-09');
  });
});
