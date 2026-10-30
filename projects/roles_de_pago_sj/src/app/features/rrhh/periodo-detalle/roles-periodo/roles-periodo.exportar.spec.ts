import { TestBed } from '@angular/core/testing';
import type { RolPagoResumenResponse } from '@models';
import { RolesPeriodoComponent } from './roles-periodo.component';
import { fallida, muchos, rol } from './roles-periodo.testing';

describe('RolesPeriodoComponent: exportar a CSV', () => {
  const crear = (roles: RolPagoResumenResponse[]) => {
    const fixture = TestBed.createComponent(RolesPeriodoComponent);
    fixture.componentRef.setInput('roles', roles);
    fixture.componentRef.setInput('publicado', true);
    fixture.componentRef.setInput('periodo', '2026-11');
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    const boton = (texto: string) =>
      Array.from(html.querySelectorAll('button')).find((b) => b.textContent?.includes(texto)) as HTMLButtonElement | undefined;
    return { fixture, componente: fixture.componentInstance, html, boton };
  };

  beforeEach(() => TestBed.configureTestingModule({ imports: [RolesPeriodoComponent] }));
  afterEach(() => vi.restoreAllMocks());

  const preparar = () => {
    let blob: Blob | undefined;
    URL.createObjectURL = vi.fn((contenido: Blob) => {
      blob = contenido;
      return 'blob:csv';
    });
    URL.revokeObjectURL = vi.fn();
    let enlace: HTMLAnchorElement | undefined;
    const original = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((etiqueta: string) => {
      const elemento = original(etiqueta);
      if (etiqueta === 'a') {
        enlace = elemento as HTMLAnchorElement;
      }
      return elemento;
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    return { blob: () => blob, enlace: () => enlace };
  };

  it('descarga todo lo que está filtrado y ordenado, no solo la página que se ve', async () => {
    const { blob, enlace } = preparar();
    const { componente } = crear(muchos(60));
    componente.exportar();

    const lineas = (await blob()!.text()).split('\r\n').filter(Boolean);
    expect(lineas).toHaveLength(61);
    expect(lineas[1]).toContain('PERSONA 001');
    expect(lineas.at(-1)).toContain('PERSONA 060');
    expect(enlace()?.download).toBe('roles-2026-11.csv');
  });

  it('respeta el filtro rápido', async () => {
    const { blob } = preparar();
    const { componente } = crear([rol(1, 'A'), rol(2, 'B', fallida), rol(3, 'C')]);
    componente.filtrarGrupo('PROBLEMA');
    componente.exportar();
    const texto = await blob()!.text();
    expect(texto).toContain('B;');
    expect(texto).not.toContain(';A;');
  });

  it('el archivo es UTF-8 con marca de orden, para que Excel muestre las tildes', async () => {
    const { blob } = preparar();
    const { componente } = crear([rol(1, 'MUÑOZ ÁNGEL')]);
    componente.exportar();
    const bytes = new Uint8Array(await blob()!.arrayBuffer());
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(blob()!.type).toContain('text/csv');
  });

  it('sin filas el botón queda desactivado', () => {
    const { boton } = crear([]);
    expect(boton('Exportar CSV')?.disabled).toBe(true);
  });
});
