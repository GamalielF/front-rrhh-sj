import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiService } from '@lumen/http';
import { AuditoriaService } from './auditoria.service';
import { filtros } from './auditoria.testing';

describe('AuditoriaService', () => {
  const api = { get: vi.fn() };
  const servicio = () => TestBed.inject(AuditoriaService);

  beforeEach(() => {
    api.get.mockReset().mockReturnValue(of({ content: 'resultado' }));
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('accesos y acciones piden la página y el tamaño junto con los filtros', async () => {
    await firstValueFrom(servicio().accesos(filtros({ resultado: 'DENEGADO' }), 2, 20));
    await firstValueFrom(servicio().acciones(filtros({ tipoAccion: 'CARGA_LOTE' }), 0, 50));
    expect(api.get.mock.calls[0][0]).toMatch(/admin\/auditoria\/accesos$/);
    expect(api.get.mock.calls[0][1]).toEqual({ params: { resultado: 'DENEGADO', pagina: 2, tamano: 20 } });
    expect(api.get.mock.calls[1][0]).toMatch(/admin\/auditoria\/acciones$/);
    expect(api.get.mock.calls[1][1]).toEqual({ params: { tipo: 'CARGA_LOTE', pagina: 0, tamano: 50 } });
  });

  it('denegados envía el mínimo, y exportar usa los filtros de accesos sin paginar', async () => {
    await firstValueFrom(servicio().denegados(filtros({ minimo: 5 })));
    await firstValueFrom(servicio().exportarAccesos(filtros({ desde: '2026-10-01' })));
    expect(api.get.mock.calls[0][0]).toMatch(/admin\/auditoria\/denegados$/);
    expect(api.get.mock.calls[0][1]).toEqual({ params: { minimo: 5 } });
    expect(api.get.mock.calls[1][0]).toMatch(/admin\/auditoria\/accesos\/exportar$/);
    expect(api.get.mock.calls[1][1]).toEqual({ params: { desde: '2026-10-01' } });
  });
});
