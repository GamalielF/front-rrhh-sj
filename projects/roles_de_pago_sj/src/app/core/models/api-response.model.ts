/** Envoltura de TODA respuesta, incluidos los errores. En un error no hay content y errors lista los detalles. */
export interface ApiResponse<T> {
  status: string;
  message: string;
  content: T;
  errors?: string[];
  timestamp: string;
  success: boolean;
}

/** Página de resultados. pagina es base 0. */
export interface PaginaResponse<T> {
  elementos: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}
