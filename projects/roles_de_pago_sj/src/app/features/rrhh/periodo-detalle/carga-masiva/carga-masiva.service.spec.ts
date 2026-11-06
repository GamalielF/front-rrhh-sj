import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, toArray } from 'rxjs';
import { ApiService } from '@lumen/http';
import type { ResultadoCargaResponse } from '@models';
import { CargaMasivaService } from './carga-masiva.service';
import { archivo } from './carga-masiva.testing';

const respuesta = (cargados: number): { content: ResultadoCargaResponse } => ({
  content: { periodo: '2026-09', total: cargados, cargados, reemplazados: 0, sinCambios: 0, rechazados: 0, simulacion: false, resultados: [] },
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

  it('sin opciones el formulario lleva solo los archivos: no manda ni motivo ni simulación', async () => {
    api.post.mockReturnValueOnce(of(respuesta(1)));

    await firstValueFrom(TestBed.inject(CargaMasivaService).cargarEnLotes('2026-09', [[archivo('1000000001.pdf')]]).pipe(toArray()));

    const formulario = api.post.mock.calls[0][1] as FormData;
    expect(formulario.has('simular')).toBe(false);
    expect(formulario.has('motivo')).toBe(false);
  });

  it('la revisión y el motivo viajan como campos del formulario, en cada lote, y no en la dirección', async () => {
    api.post.mockReturnValueOnce(of(respuesta(1))).mockReturnValueOnce(of(respuesta(1)));
    const lotes = [[archivo('1000000001.pdf')], [archivo('1000000002.pdf')]];

    await firstValueFrom(
      TestBed.inject(CargaMasivaService)
        .cargarEnLotes('2026-09', lotes, { simular: true, motivo: 'Se subió el rol equivocado' })
        .pipe(toArray()),
    );

    for (const [direccion, cuerpo] of api.post.mock.calls) {
      expect(direccion).not.toContain('?');
      expect(direccion).not.toContain('motivo');
      expect((cuerpo as FormData).get('simular')).toBe('true');
      expect((cuerpo as FormData).get('motivo')).toBe('Se subió el rol equivocado');
    }
  });
});
