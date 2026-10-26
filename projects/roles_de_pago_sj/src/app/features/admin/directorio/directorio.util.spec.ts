import type { PerfilDirectorioResponse, ResultadoSincronizacionResponse } from '@models';
import { aFilasPerfiles, datosDeSincronizacion } from './directorio.util';

const perfil = (cambios: Partial<PerfilDirectorioResponse> = {}): PerfilDirectorioResponse => ({
  username: 'jperez',
  nombreCompleto: 'PEREZ LOPEZ JUAN',
  cargo: 'ANALISTA',
  email: 'jperez@coopsanjose.fin.ec',
  estado: 'ACTIVO',
  cedula: '1712345675',
  ...cambios,
});

describe('aFilasPerfiles', () => {
  it('muestra la cédula completa y el estado en español', () => {
    const [activo, baja] = aFilasPerfiles([perfil(), perfil({ username: 'zz', estado: 'INACTIVO' })]);
    expect(activo).toMatchObject({ cedula: '1712345675', estadoEtiqueta: 'Activo', correo: 'jperez@coopsanjose.fin.ec' });
    expect(baja.estadoEtiqueta).toBe('De baja');
  });

  it('tolera los datos que falten', () => {
    const [fila] = aFilasPerfiles([perfil({ nombreCompleto: null, cargo: null, email: null, cedula: null })]);
    expect(fila).toMatchObject({ nombre: '—', cargo: '—', correo: '—', cedula: '—' });
  });
});

describe('datosDeSincronizacion', () => {
  const resultado = (cambios: Partial<ResultadoSincronizacionResponse> = {}): ResultadoSincronizacionResponse => ({
    recibidos: 300,
    creados: 2,
    actualizados: 5,
    sinCambios: 290,
    inactivados: 1,
    omitidos: 2,
    cedulasConDigitoInvalido: 3,
    inicio: '2026-10-26T10:00:00',
    fin: '2026-10-26T10:00:08',
    ...cambios,
  });

  it('resume cada cifra con su etiqueta', () => {
    const datos = datosDeSincronizacion(resultado());
    expect(datos.map((d) => `${d.valor} ${d.etiqueta}`)).toEqual([
      '300 recibidos del AD',
      '2 nuevos',
      '5 actualizados',
      '290 sin cambios',
      '1 dados de baja',
      '2 omitidos',
      '3 con dígito verificador inválido',
    ]);
  });

  it('resalta lo que merece atención: bajas, omitidos y cédulas inválidas', () => {
    const atencion = datosDeSincronizacion(resultado()).filter((d) => d.variante === 'warning');
    expect(atencion.map((d) => d.etiqueta)).toEqual(['dados de baja', 'omitidos', 'con dígito verificador inválido']);
    const limpio = datosDeSincronizacion(resultado({ inactivados: 0, omitidos: 0, cedulasConDigitoInvalido: 0 }));
    expect(limpio.some((d) => d.variante === 'warning')).toBe(false);
  });
});
