import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { NotificacionesService, RrhhService } from '../../rrhh';
import { EstadoPeriodoService } from './estado-periodo.service';

const periodo = (valor: string) => ({ periodo: valor, estado: 'CARGADO', fechaPublicacion: null, publicadoPor: null, rolesActivos: 1 });
const resumen = (estadoPeriodo: 'CARGADO' | 'PUBLICADO') => ({ periodo: '2026-10', estadoPeriodo, rolesActivos: 5, sinRol: 0 });

describe('EstadoPeriodoService', () => {
  const rrhh = { periodos: vi.fn(), resumen: vi.fn(), cobertura: vi.fn() };
  const avisos = { informe: vi.fn() };
  const HOY = new Date(2026, 9, 26);

  const cargar = () => firstValueFrom(TestBed.inject(EstadoPeriodoService).cargar(HOY));

  beforeEach(() => {
    Object.values(rrhh).forEach((mock) => mock.mockReset());
    avisos.informe.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: RrhhService, useValue: rrhh },
        { provide: NotificacionesService, useValue: avisos },
      ],
    });
  });

  it('sin ningún período no consulta nada más y avisa que falta el del mes', async () => {
    rrhh.periodos.mockReturnValue(of([]));
    expect(await cargar()).toEqual({ periodo: null, existeActual: false, resumen: null, cobertura: null, informe: null });
    expect(rrhh.resumen).not.toHaveBeenCalled();
  });

  it('toma el período más reciente, y en preparación no pide lectura ni avisos', async () => {
    rrhh.periodos.mockReturnValue(of([periodo('2026-08'), periodo('2026-10'), periodo('2026-09')]));
    rrhh.resumen.mockReturnValue(of(resumen('CARGADO')));
    const estado = await cargar();
    expect(rrhh.resumen).toHaveBeenCalledWith('2026-10');
    expect(estado).toMatchObject({ periodo: '2026-10', existeActual: true, cobertura: null, informe: null });
    expect(rrhh.cobertura).not.toHaveBeenCalled();
    expect(avisos.informe).not.toHaveBeenCalled();
  });

  it('si el más reciente no es el del mes actual lo indica', async () => {
    rrhh.periodos.mockReturnValue(of([periodo('2026-09')]));
    rrhh.resumen.mockReturnValue(of(resumen('CARGADO')));
    expect((await cargar()).existeActual).toBe(false);
  });

  it('publicado pide la lectura y los avisos', async () => {
    rrhh.periodos.mockReturnValue(of([periodo('2026-10')]));
    rrhh.resumen.mockReturnValue(of(resumen('PUBLICADO')));
    rrhh.cobertura.mockReturnValue(of({ leidos: 1 }));
    avisos.informe.mockReturnValue(of({ fallidas: 0 }));
    const estado = await cargar();
    expect(estado.cobertura).toEqual({ leidos: 1 });
    expect(estado.informe).toEqual({ fallidas: 0 });
  });

  it('si fallan la lectura o los avisos el resto igual se muestra', async () => {
    rrhh.periodos.mockReturnValue(of([periodo('2026-10')]));
    rrhh.resumen.mockReturnValue(of(resumen('PUBLICADO')));
    rrhh.cobertura.mockReturnValue(throwError(() => new Error('x')));
    avisos.informe.mockReturnValue(throwError(() => new Error('x')));
    const estado = await cargar();
    expect(estado).toMatchObject({ periodo: '2026-10', cobertura: null, informe: null });
    expect(estado.resumen).not.toBeNull();
  });

  it('si falla lo principal el error sí se propaga', async () => {
    rrhh.periodos.mockReturnValue(throwError(() => new Error('sin conexión')));
    await expect(cargar()).rejects.toThrow('sin conexión');
  });
});
