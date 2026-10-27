import { ValidatorFn } from '@angular/forms';
import type { UserSession } from '@lumen/auth';
import { CEDULA_DE_10_DIGITOS } from './mi-rol-pago.model';

export function cedulaDeSesion(usuario: UserSession | null): string | null {
  const identificacion = String(usuario?.id ?? '').trim();
  return CEDULA_DE_10_DIGITOS.test(identificacion) ? identificacion : null;
}

export function elegirPeriodoInicial(periodos: string[], solicitado: string | null): string | null {
  return solicitado && periodos.includes(solicitado) ? solicitado : (periodos[0] ?? null);
}

export function mascararCedula(cedula: string): string {
  return `${cedula.slice(0, 2)}******${cedula.slice(-2)}`;
}

export function cedulaCoincideConSesion(cedulaSesion: string | null): ValidatorFn {
  return (control) => {
    const cedula = String(control.value ?? '');
    if (!cedulaSesion || !CEDULA_DE_10_DIGITOS.test(cedula)) {
      return null;
    }
    return cedula === cedulaSesion ? null : { cedulaNoCoincide: true };
  };
}
