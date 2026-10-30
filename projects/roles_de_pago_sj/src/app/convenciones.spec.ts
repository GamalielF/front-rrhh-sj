/// <reference types="node" />
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';

const raiz = (): string => {
  let carpeta = process.cwd();
  while (!existsSync(join(carpeta, 'angular.json')) && dirname(carpeta) !== carpeta) {
    carpeta = dirname(carpeta);
  }
  return join(carpeta, 'projects/roles_de_pago_sj');
};

const plantillas = (carpeta: string): string[] =>
  readdirSync(carpeta).flatMap((nombre) => {
    const ruta = join(carpeta, nombre);
    if (statSync(ruta).isDirectory()) {
      return plantillas(ruta);
    }
    return ruta.endsWith('.html') ? [ruta] : [];
  });

describe('convenciones de la interfaz', () => {
  const todas = plantillas(join(raiz(), 'src/app'));

  it('encuentra las plantillas (si no, las demás comprobaciones no sirven)', () => {
    expect(todas.length).toBeGreaterThan(20);
  });

  it('ninguna tarjeta lleva el título como atributo estático: el navegador lo mostraría como un recuadro flotante', () => {
    const infractoras = todas.filter((ruta) => /<ui-card\b[^>]*?\stitle="/s.test(readFileSync(ruta, 'utf-8')));
    expect(infractoras).toEqual([]);
  });

  it('todo campo de cédula abre el teclado numérico en el celular', () => {
    const sinTeclado = todas.flatMap((ruta) =>
      (readFileSync(ruta, 'utf-8').match(/<ui-input\b[^>]*>/gs) ?? [])
        .filter((etiqueta) => etiqueta.includes('label="Cédula"') && !etiqueta.includes('type="tel"'))
        .map(() => ruta),
    );
    expect(sinTeclado).toEqual([]);
  });

  it('la página está en español y tiene un título propio y una descripción', () => {
    const indice = readFileSync(join(raiz(), 'src/index.html'), 'utf-8');
    expect(indice).toContain('<html lang="es">');
    expect(indice).toContain('<title>Roles de pago · COOPSANJOSE</title>');
    expect(indice).not.toContain('RolesDePagoSj');
    expect(indice).toContain('name="description"');
  });

  it('el ícono de la pestaña es un .ico válido y liviano', () => {
    const icono = readFileSync(join(raiz(), 'public/favicon.ico'));
    expect([...icono.subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(icono.length).toBeLessThan(50_000);
  });
});
