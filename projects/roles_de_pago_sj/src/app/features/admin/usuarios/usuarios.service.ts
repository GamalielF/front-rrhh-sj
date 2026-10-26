import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { ApiResponse, NombreRol, OtorgarRolRequest, PaginaResponse, UsuarioAdminResponse } from '@models';
import type { CambioRol } from './usuarios.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private api = inject(ApiService);

  buscar(texto: string, pagina: number, tamano: number): Observable<PaginaResponse<UsuarioAdminResponse>> {
    const params: Record<string, string | number> = { pagina, tamano };
    if (texto.trim()) {
      params['buscar'] = texto.trim();
    }
    return this.api
      .get<ApiResponse<PaginaResponse<UsuarioAdminResponse>>>(`${env.rolesPagoApiUrl}admin/usuarios`, { params })
      .pipe(map(({ content }) => content));
  }

  privilegiados(): Observable<UsuarioAdminResponse[]> {
    return this.api
      .get<ApiResponse<UsuarioAdminResponse[]>>(`${env.rolesPagoApiUrl}admin/usuarios/privilegiados`)
      .pipe(map(({ content }) => content));
  }

  aplicar(username: string, cambio: CambioRol): Observable<UsuarioAdminResponse> {
    const ruta = `${env.rolesPagoApiUrl}admin/usuarios/${encodeURIComponent(username)}/roles/${cambio.rol}`;
    return cambio.tipo === 'revocar' ? this.revocar(ruta) : this.otorgar(ruta, cambio.rol, cambio.verRolesAjenos);
  }

  private otorgar(ruta: string, rol: NombreRol, verRolesAjenos?: boolean): Observable<UsuarioAdminResponse> {
    const cuerpo: OtorgarRolRequest = rol === 'RRHH' && verRolesAjenos !== undefined ? { verRolesAjenos } : {};
    return this.api
      .post<ApiResponse<UsuarioAdminResponse>>(`${ruta}/otorgar`, cuerpo)
      .pipe(map(({ content }) => content));
  }

  private revocar(ruta: string): Observable<UsuarioAdminResponse> {
    return this.api.post<ApiResponse<UsuarioAdminResponse>>(`${ruta}/revocar`, {}).pipe(map(({ content }) => content));
  }
}
