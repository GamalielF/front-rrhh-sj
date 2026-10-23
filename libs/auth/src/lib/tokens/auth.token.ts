import { EnvironmentProviders, InjectionToken, Provider, Type, inject, provideAppInitializer } from '@angular/core';
import { AuthConfig, UserProfileLoader, UserSession } from '../models/auth.models';
import { AuthService } from '../services/auth.service';

export const DEFAULT_AUTH_CONFIG: Required<AuthConfig> = {
  loginUrl: '/api/v1/auth/login',
  mfaVerifyUrl: '/api/v1/auth/mfa/verify',
  tokenName: 'access_token',
  usernameClaim: 'sub',
  defaultRedirectUrl: '/',
  loginRedirectUrl: '/login',
  forbiddenRedirectUrl: '/forbidden',
  refreshUrl: '/api/v1/auth/refresh',
  enableRefreshToken: false,
  refreshMode: 'body',
  withCredentials: false,
  tokenStorage: 'localStorage',
  persistUserInStorage: false,
  enableDebugMode: false,
};

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');
export const USER_PROFILE_LOADER = new InjectionToken<UserProfileLoader<any>>('USER_PROFILE_LOADER');

export function provideAuth(config?: Partial<AuthConfig>): (Provider | EnvironmentProviders)[] {
  return [
    {
      provide: AUTH_CONFIG,
      useValue: { ...DEFAULT_AUTH_CONFIG, ...(config || {}) },
    },
    provideAppInitializer(() => {
      const authService = inject(AuthService);
      if (authService.isAuthenticated()) {
        return authService.loadUserProfile().toPromise();
      }
      return Promise.resolve();
    }),
  ];
}


export function provideUserProfileLoader<T extends UserSession>(
  loader: Type<UserProfileLoader<T>> | UserProfileLoader<T>
): Provider {
  if (typeof loader === 'function') {
    return { provide: USER_PROFILE_LOADER, useClass: loader };
  }
  return { provide: USER_PROFILE_LOADER, useValue: loader };
}
