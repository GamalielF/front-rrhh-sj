import { TestBed } from '@angular/core/testing';
import { ErrorCargaComponent } from './error-carga.component';
import { botonReintentar } from './error-carga.testing';

describe('ErrorCargaComponent', () => {
  const crear = (mensaje = 'No hay conexión con el servidor', etiqueta?: string) => {
    const fixture = TestBed.createComponent(ErrorCargaComponent);
    fixture.componentRef.setInput('mensaje', mensaje);
    if (etiqueta) {
      fixture.componentRef.setInput('etiqueta', etiqueta);
    }
    fixture.detectChanges();
    const reintentar = vi.fn();
    fixture.componentInstance.reintentar.subscribe(reintentar);
    return { fixture, reintentar, html: fixture.nativeElement as HTMLElement };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [ErrorCargaComponent] }));

  it('muestra el motivo del error como una alerta', () => {
    const { html } = crear('No hay conexión con el servidor');
    expect(html.textContent).toContain('No hay conexión con el servidor');
    expect(html.querySelector('[role="alert"]')).not.toBeNull();
  });

  it('ofrece "Volver a cargar" y avisa cuando se pulsa', () => {
    const { html, reintentar } = crear();
    botonReintentar(html)?.click();
    expect(reintentar).toHaveBeenCalledTimes(1);
  });

  it('el texto del botón se puede cambiar', () => {
    const { html } = crear('x', 'Probar de nuevo');
    expect(html.textContent).toContain('Probar de nuevo');
    expect(botonReintentar(html)).toBeUndefined();
  });
});
