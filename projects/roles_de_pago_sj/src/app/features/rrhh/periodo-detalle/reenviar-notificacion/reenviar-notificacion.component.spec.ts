import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import type { ResultadoReenvioResponse } from '@models';
import type { RolFila } from '../../rrhh.model';
import { NotificacionesService } from '../notificaciones-periodo/notificaciones-periodo.service';
import { ReenviarNotificacionComponent } from './reenviar-notificacion.component';
import { aceptado, filaPerez, rechazado } from './reenviar-notificacion.testing';

describe('ReenviarNotificacionComponent', () => {
  const servicio = { reenviar: vi.fn() };

  const crear = (rol: RolFila | null = filaPerez) => {
    const fixture = TestBed.createComponent(ReenviarNotificacionComponent);
    fixture.componentRef.setInput('periodo', '2026-10');
    fixture.componentRef.setInput('rol', rol);
    fixture.detectChanges();
    const componente = fixture.componentInstance;
    const reenviado = vi.fn();
    const cerrado = vi.fn();
    componente.reenviado.subscribe(reenviado);
    componente.cerrado.subscribe(cerrado);
    return { fixture, componente, reenviado, cerrado, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => {
    servicio.reenviar.mockReset().mockReturnValue(of(aceptado));
    TestBed.configureTestingModule({
      imports: [ReenviarNotificacionComponent],
      providers: [{ provide: NotificacionesService, useValue: servicio }],
    });
  });

  it('sin un rol elegido no muestra nada', () => {
    const { html } = crear(null);
    expect(html.textContent).not.toContain('Reenviar notificación');
  });

  it('con un rol elegido pide confirmación, con el nombre y el estado actual del aviso', () => {
    const { html } = crear();
    expect(html.textContent).toContain('Reenviar notificación');
    expect(html.textContent).toContain('PEREZ JUAN');
    expect(html.textContent).toContain('Estado actual del aviso: Notificado.');
    expect(servicio.reenviar).not.toHaveBeenCalled();
  });

  it('confirmar reenvía ese rol del período, avisa el resultado y cierra', () => {
    const { componente, reenviado, cerrado } = crear();
    componente.confirmar();
    expect(servicio.reenviar).toHaveBeenCalledWith('2026-10', 7);
    expect(reenviado).toHaveBeenCalledWith({ fila: filaPerez, resultado: aceptado });
    expect(cerrado).toHaveBeenCalledTimes(1);
    expect(componente.procesando()).toBe(false);
  });

  it('si la API no aceptó el reenvío igual avisa el resultado, para que la página lo muestre como fallo', () => {
    servicio.reenviar.mockReturnValue(of(rechazado as ResultadoReenvioResponse));
    const { componente, reenviado } = crear();
    componente.confirmar();
    expect(reenviado).toHaveBeenCalledWith({ fila: filaPerez, resultado: rechazado });
  });

  it('si el servidor lo rechaza (por ejemplo, el aviso está en cola) deja la ventana abierta con el motivo', () => {
    servicio.reenviar.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'El aviso de esta persona está en cola de envío' } })),
    );
    const { fixture, componente, reenviado, cerrado, html } = crear();
    componente.confirmar();
    fixture.detectChanges();
    expect(html.textContent).toContain('El aviso de esta persona está en cola de envío');
    expect(reenviado).not.toHaveBeenCalled();
    expect(cerrado).not.toHaveBeenCalled();
    expect(componente.procesando()).toBe(false);
  });

  it('mientras reenvía no deja confirmar otra vez ni cancelar', () => {
    const pendiente = new Subject<ResultadoReenvioResponse>();
    servicio.reenviar.mockReturnValue(pendiente);
    const { componente, cerrado } = crear();
    componente.confirmar();
    componente.confirmar();
    componente.cancelar();
    expect(servicio.reenviar).toHaveBeenCalledTimes(1);
    expect(componente.procesando()).toBe(true);
    expect(cerrado).not.toHaveBeenCalled();
    pendiente.next(aceptado);
    pendiente.complete();
    expect(componente.procesando()).toBe(false);
  });

  it('cancelar cierra sin reenviar y limpia el error anterior', () => {
    servicio.reenviar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409, error: { message: 'x' } })));
    const { componente, cerrado } = crear();
    componente.confirmar();
    expect(componente.error()).not.toBe('');
    componente.cancelar();
    expect(componente.error()).toBe('');
    expect(cerrado).toHaveBeenCalledTimes(1);
  });

  it('confirmar sin un rol elegido no hace nada', () => {
    const { componente } = crear(null);
    componente.confirmar();
    expect(servicio.reenviar).not.toHaveBeenCalled();
  });
});
