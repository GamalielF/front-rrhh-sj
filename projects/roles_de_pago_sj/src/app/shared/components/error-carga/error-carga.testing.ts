export const botonReintentar = (html: HTMLElement): HTMLButtonElement | undefined =>
  Array.from(html.querySelectorAll('button')).find((boton) => boton.textContent?.includes('Volver a cargar')) as
    | HTMLButtonElement
    | undefined;
