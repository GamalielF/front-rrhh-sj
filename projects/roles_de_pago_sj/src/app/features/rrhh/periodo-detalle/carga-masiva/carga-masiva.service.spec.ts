import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, toArray } from 'rxjs';
import { ApiService } from '@lumen/http';
import type { ResultadoCargaResponse } from '@models';
import { CargaMasivaService } from './carga-masiva.service';
import { archivo } from './carga-masiva.testing';

const respuesta = (cargados: number): { content: ResultadoCargaResponse } => ({
  content: { periodo: '2026-09', total: cargados, cargados, reemplazados: 0, sinCambios: 0, rechazados: 0, resultados: [] },
});

describe('CargaMasivaService', () => {
  const api = { post: vi.fn() };

  beforeEach(() => {
    api.post.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
  });

  it('envía cada lote como formulario con el campo "archivos", uno tras otro, y acumula el avance', async () => {
    api.post.mockReturnValueOnce(of(respuesta(2))).mockReturnValueOnce(of(respuesta(1)));
    const lotes = [
      [archivo('1000000001.pdf'), archivo('1000000002.pdf')],
      [archivo('1000000003.pdf')],
    ];

    const avances = await firstValueFrom(TestBed.inject(CargaMasivaService).cargarEnLotes('2026-09', lotes).pipe(toArray()));

    expect(api.post).toHaveBeenCalledTimes(2);
    const [direccion, cuerpo] = api.post.mock.calls[0];
    expect(direccion).toContain('rrhh/periodos/2026-09/roles-pago');
    expect(cuerpo).toBeInstanceOf(FormData);
    expect((cuerpo as FormData).getAll('archivos')).toHaveLength(2);
    expect((api.post.mock.calls[1][1] as FormData).getAll('archivos')).toHaveLength(1);
    expect(avances.map((a) => [a.loteActual, a.totalLotes, a.resumen.cargados])).toEqual([
      [1, 2, 2],
      [2, 2, 3],
    ]);
  });
});
