export function base64ToBlob(base64: string, tipoContenido: string): Blob {
  const bytes = Uint8Array.from(atob(base64), (caracter) => caracter.charCodeAt(0));
  return new Blob([bytes], { type: tipoContenido });
}

export function descargarBlob(blob: Blob, nombreArchivo: string): void {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
