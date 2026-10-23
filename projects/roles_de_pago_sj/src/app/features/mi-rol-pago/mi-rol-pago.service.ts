import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { ApiResponse, ConsultaRolPagoRequest, RolPagoPdfResponse } from '@models';

@Injectable({ providedIn: 'root' })
export class MiRolPagoService {
  private api = inject(ApiService);

  periodos(): Observable<string[]> {
    return this.api
      .get<ApiResponse<string[]>>(`${env.rolesPagoApiUrl}mi-rol-pago/periodos`)
      .pipe(map(({ content }) => content));
  }

  consultar(solicitud: ConsultaRolPagoRequest): Observable<RolPagoPdfResponse> {
    return this.api
      .post<ApiResponse<RolPagoPdfResponse>>(`${env.rolesPagoApiUrl}mi-rol-pago/consultar`, solicitud)
      .pipe(map(({ content }) => content));
  }
}
