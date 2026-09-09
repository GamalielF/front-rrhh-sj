import { HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';

export type QueryParamsType =
  | HttpParams
  | Record<string, string | number | boolean | readonly (string | number | boolean)[] | null | undefined>;

export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  params?: QueryParamsType;
  context?: HttpContext;
  responseType?: 'json';
  withCredentials?: boolean;
}

export interface HttpConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
}

export interface ApiError {
  status: number;
  message: string;
  error?: unknown;
}
