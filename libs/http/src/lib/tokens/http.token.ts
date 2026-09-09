import { InjectionToken, Provider } from '@angular/core';
import { HttpConfig } from '../models/http.models';

export const DEFAULT_HTTP_CONFIG: HttpConfig = {
  baseUrl: '',
  defaultHeaders: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

export const HTTP_CONFIG = new InjectionToken<HttpConfig>('HTTP_CONFIG');

export function provideHttp(config?: Partial<HttpConfig>): Provider[] {
  return [
    {
      provide: HTTP_CONFIG,
      useValue: { ...DEFAULT_HTTP_CONFIG, ...(config || {}) },
    },
  ];
}
