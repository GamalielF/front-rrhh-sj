import { InjectionToken, Provider } from '@angular/core';
import { AuthConfig } from '../models/auth.models';

export const DEFAULT_AUTH_CONFIG: Required<AuthConfig> = {
  loginUrl: '/api/auth/login',
  tokenName: 'access_token',
  defaultRedirectUrl: '/',
  loginRedirectUrl: '/login',
  refreshUrl: '/api/auth/refresh',
  enableRefreshToken: false,
  forbiddenRedirectUrl: '/forbidden',
};

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('AUTH_CONFIG');

export function provideAuth(config?: Partial<AuthConfig>): Provider[] {
  return [
    {
      provide: AUTH_CONFIG,
      useValue: { ...DEFAULT_AUTH_CONFIG, ...(config || {}) },
    },
  ];
}
