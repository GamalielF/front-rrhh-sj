import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { AuditoriaService } from '../../admin/auditoria';
import { DirectorioService } from '../../admin/directorio';
import { AlertasAdminService } from './alertas-admin.service';

const estado = { activos: 1, inactivos: 0, ultimaSincronizacion: '2026-10-25T08:00:00', resultadoUltima: 'EXITOSA', mensajeUltima: null };

describe('AlertasAdminService', () => {
  const directorio = { estado: vi.fn() };
  const auditoria = { denegados: vi.fn() };
  const HOY = new Date(2026, 9, 26);

  const cargar = () => firstValueFrom(TestBed.inject(AlertasAdminService).cargar(HOY));

  beforeEach(() => {
    directorio.estado.mockReset().mockReturnValue(of(estado));
    auditoria.denegados.mockReset().mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        { provide: DirectorioService, useValue: directorio },
        { provide: AuditoriaService, useValue: auditoria },
      ],
    });
  });

  it('pide los denegados de los últimos 7 días con mínimo de 3 intentos', async () => {
    await cargar();
    expect(auditoria.denegados).toHaveBeenCalledWith(expect.objectContaining({ desde: '2026-10-19', hasta: '2026-10-26', minimo: 3 }));
  });

  it('sin problemas no hay alertas y el resultado está completo', async () => {
    expect(await cargar()).toEqual({ alertas: [], incompleto: false });
  });

  it('junta las alertas del directorio y de los denegados', async () => {
    directorio.estado.mockReturnValue(of({ ...estado, resultadoUltima: 'FALLIDA', mensajeUltima: 'AD caído' }));
    auditoria.denegados.mockReturnValue(of([{ usuario: 'jperez', intentos: 4, cedulasDistintas: 4, ultimoIntento: '2026-10-26T10:00:00' }]));
    const { alertas, incompleto } = await cargar();
    expect(alertas.map((a) => a.variante)).toEqual(['danger', 'warning']);
    expect(incompleto).toBe(false);
  });

  it('si una de las dos comprobaciones falla, la otra igual se muestra y se avisa que quedó incompleto', async () => {
    directorio.estado.mockReturnValue(throwError(() => new Error('x')));
    auditoria.denegados.mockReturnValue(of([{ usuario: 'jperez', intentos: 4, cedulasDistintas: 4, ultimoIntento: '2026-10-26T10:00:00' }]));
    const { alertas, incompleto } = await cargar();
    expect(alertas).toHaveLength(1);
    expect(incompleto).toBe(true);
  });
});
