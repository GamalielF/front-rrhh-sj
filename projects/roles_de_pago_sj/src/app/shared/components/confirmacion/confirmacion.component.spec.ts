import { TestBed } from '@angular/core/testing';
import { ConfirmacionComponent } from './confirmacion.component';

describe('ConfirmacionComponent', () => {
  const crear = (entradas: Record<string, unknown> = {}) => {
    const fixture = TestBed.createComponent(ConfirmacionComponent);
    Object.entries({ abierta: true, titulo: 'Quitar RRHH', mensaje: 'Dejará de tener el rol.', ...entradas }).forEach(
      ([nombre, valor]) => fixture.componentRef.setInput(nombre, valor),
    );
    fixture.detectChanges();
    const confirmar = vi.fn();
    const cancelar = vi.fn();
    fixture.componentInstance.confirmar.subscribe(confirmar);
    fixture.componentInstance.cancelar.subscribe(cancelar);
    return { fixture, confirmar, cancelar, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [ConfirmacionComponent] }));

  it('cerrada no muestra nada', () => {
    const { html } = crear({ abierta: false });
    expect(html.textContent).not.toContain('Quitar RRHH');
  });

  it('abierta muestra el título, el mensaje y los dos botones', () => {
    const { html } = crear({ etiquetaConfirmar: 'Quitar' });
    expect(html.textContent).toContain('Quitar RRHH');
    expect(html.textContent).toContain('Dejará de tener el rol.');
    expect(html.textContent).toContain('Cancelar');
    expect(html.textContent).toContain('Quitar');
  });

  it('muestra el error del servidor dentro de la ventana', () => {
    const { html } = crear({ error: 'No puede quitarse a sí mismo el rol ADMIN' });
    expect(html.textContent).toContain('No puede quitarse a sí mismo el rol ADMIN');
  });

  it('los botones avisan con su evento', () => {
    const { fixture, confirmar, cancelar } = crear();
    fixture.componentInstance.confirmar.emit();
    fixture.componentInstance.cancelar.emit();
    expect(confirmar).toHaveBeenCalledTimes(1);
    expect(cancelar).toHaveBeenCalledTimes(1);
  });
});
