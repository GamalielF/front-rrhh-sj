export function archivo(nombre: string, bytes = 1000): File {
  const resultado = new File(['x'], nombre, { type: 'application/pdf' });
  Object.defineProperty(resultado, 'size', { value: bytes });
  return resultado;
}
