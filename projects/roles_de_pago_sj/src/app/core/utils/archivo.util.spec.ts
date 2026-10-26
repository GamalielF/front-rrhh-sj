import { base64ToBlob, descargarBlob } from './archivo.util';

describe('base64ToBlob', () => {
  it('reconstruye el contenido y el tipo del archivo', async () => {
    const blob = base64ToBlob(btoa('usuario;resultado\nfsepa;PERMITIDO'), 'text/csv');
    expect(blob.type).toBe('text/csv');
    expect(await blob.text()).toBe('usuario;resultado\nfsepa;PERMITIDO');
  });
});

describe('descargarBlob', () => {
  it('descarga con el nombre indicado y libera la dirección temporal', () => {
    URL.createObjectURL = vi.fn(() => 'blob:csv');
    URL.revokeObjectURL = vi.fn();
    const clic = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    let enlace: HTMLAnchorElement | undefined;
    const crear = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((etiqueta: string) => {
      const elemento = crear(etiqueta);
      if (etiqueta === 'a') {
        enlace = elemento as HTMLAnchorElement;
      }
      return elemento;
    });

    descargarBlob(new Blob(['x']), 'accesos-2026-10.csv');

    expect(enlace?.download).toBe('accesos-2026-10.csv');
    expect(enlace?.href).toContain('blob:csv');
    expect(clic).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
    vi.restoreAllMocks();
  });
});
