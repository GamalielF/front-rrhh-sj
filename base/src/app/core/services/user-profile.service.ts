import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserProfileLoader, UserSession } from '@lumen/auth';
import { ApiService } from '@lumen/http';
import { env } from '@env';
import type { UserProfileResponse } from '@models';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService implements UserProfileLoader<UserSession> {
  private api = inject(ApiService);

  loadProfile(context: {
    username?: string;
    token?: string;
    currentUser?: UserSession | null;
  }): Observable<UserSession | null> {
    if (!context.username) {
      return of(null);
    }

    const url = env.userProfileUrl;

    return this.api.get<UserProfileResponse>(url, {
      params: { codUsuario: context.username },
    }).pipe(
      map((response) => {
        const item = response?.content?.[0];
        if (!item) {
          return null;
        }

        const roles: string[] = Array.isArray(item.NOMBREROLES)
          ? item.NOMBREROLES
          : item.NOMBREROLES
          ? [item.NOMBREROLES]
          : [];

        return {
          id: item.IDENTIFICACION || item.CODIGOUSUARIO || 'DEFAULT_ID',
          username: item.CODIGOUSUARIO || context.username || 'DEFAULT_USERNAME',
          name: item.NOMBRE || 'DEFAULT_NAME',
          roles,
          raw: item,
        };
      }),
      catchError(() => of(null))
    );
  }
}
