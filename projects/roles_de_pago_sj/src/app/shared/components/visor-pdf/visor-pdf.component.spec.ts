import { TestBed } from '@angular/core/testing';
import type { RolPagoPdfResponse } from '@models';
import { VisorPdfComponent } from './visor-pdf.component';

const PDF: RolPagoPdfResponse = {
  periodo: '2026-09',
  nombreArchivo: '1712345675.pdf',
  tipoContenido: 'application/pdf',
  tamanoBytes: 5,
  contenidoBase64: 'JVBERi0=',
};

describe('VisorPdfComponent', () => {
  const crear = (permitirDescarga?: boolean) => {
    const fixture = TestBed.createComponent(VisorPdfComponent);
    fixture.componentRef.setInput('pdf', PDF);
    if (permitirDescarga !== undefined) {
      fixture.componentRef.setInput('permitirDescarga', permitirDescarga);
    }
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    const boton = (texto: string) =>
      Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement | undefined;
    return { fixture, html, boton };
  };

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:rol');
    URL.revokeObjectURL = vi.fn();
    TestBed.configureTestingModule({ imports: [VisorPdfComponent] });
  });

  afterEach(() => vi.restoreAllMocks());

  it('muestra el PDF con un título que un lector de pantalla puede leer', () => {
    const { html } = crear();
    expect(html.querySelector('iframe')?.getAttribute('title')).toBe('Rol de pago 2026-09');
  });

  it('por defecto solo muestra el PDF: sin botones, como cuando RRHH consulta el rol de otra persona', () => {
    const { html, boton } = crear();
    expect(boton('Descargar')).toBeUndefined();
    expect(html.querySelectorAll('button')).toHaveLength(0);
  });

  it('cuando se permite, ofrece descargar y abrir en otra pestaña', () => {
    const { boton } = crear(true);
    expect(boton('Descargar PDF')).toBeDefined();
    expect(boton('Abrir en otra pestaña')).toBeDefined();
  });

  it('Descargar guarda el archivo con el mes en el nombre y sin la cédula', () => {
    let enlace: HTMLAnchorElement | undefined;
    const original = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((etiqueta: string) => {
      const elemento = original(etiqueta);
      if (etiqueta === 'a') {
        enlace = elemento as HTMLAnchorElement;
      }
      return elemento;
    });
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    const { boton } = crear(true);

    boton('Descargar PDF')?.click();

    expect(clic).toHaveBeenCalledTimes(1);
    expect(enlace?.download).toBe('rol-de-pago-2026-09.pdf');
    expect(enlace?.download).not.toContain('1712345675');
  });

  it('Abrir en otra pestaña abre el PDF aparte, sin dar acceso a esta ventana', () => {
    const abrir = vi.spyOn(window, 'open').mockReturnValue(null);
    const { boton } = crear(true);

    boton('Abrir en otra pestaña')?.click();

    expect(abrir).toHaveBeenCalledWith('blob:rol', '_blank', 'noopener');
  });
});
