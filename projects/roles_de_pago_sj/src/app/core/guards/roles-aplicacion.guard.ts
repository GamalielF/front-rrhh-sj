import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { PerfilAplicacionService, tieneAlgunRol } from '@services';
import type { NombreRol } from '@models';

export function rolesAplicacionGuard(...permitidos: NombreRol[]): CanActivateFn {
  return () => {
    const router = inject(Router);
    return inject(PerfilAplicacionService)
      .perfil()
      .pipe(
        take(1),
        map((perfil) => (tieneAlgunRol(perfil, permitidos) ? true : router.createUrlTree(['/home']))),
      );
  };
}
