export function formatearPeriodo(periodo: string): string {
  const [anio, mes] = periodo.split('-').map(Number);
  if (!anio || !mes) {
    return periodo;
  }
  const texto = new Intl.DateTimeFormat('es-EC', { month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(anio, mes - 1, 1)))
    .replace(' de ', ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatearFechaHora(valor: string | null | undefined): string {
  const partes = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(valor ?? '');
  return partes ? `${partes[3]}/${partes[2]}/${partes[1]} ${partes[4]}:${partes[5]}` : (valor ?? '—');
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function fechaIso(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

export function restarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() - dias);
  return resultado;
}
