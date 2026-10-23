export function base64ToBlob(base64: string, tipoContenido: string): Blob {
  const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
  return new Blob([bytes], { type: tipoContenido });
}
