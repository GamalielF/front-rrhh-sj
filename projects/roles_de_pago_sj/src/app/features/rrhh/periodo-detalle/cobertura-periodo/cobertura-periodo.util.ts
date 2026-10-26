export function porcentajeLeido(leidos: number, publicados: number): number {
  return publicados > 0 ? Math.round((leidos * 100) / publicados) : 0;
}
