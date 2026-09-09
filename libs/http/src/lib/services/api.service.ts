import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HTTP_CONFIG, DEFAULT_HTTP_CONFIG } from '../tokens/http.token';
import { HttpConfig, HttpOptions, QueryParamsType } from '../models/http.models';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private config: HttpConfig = {
    ...DEFAULT_HTTP_CONFIG,
    ...(inject(HTTP_CONFIG, { optional: true }) || {}),
  };

  get<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.get<T>(this.resolveUrl(endpoint), this.prepareOptions(options));
  }

  post<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T> {
    return this.http.post<T>(this.resolveUrl(endpoint), body, this.prepareOptions(options));
  }

  put<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T> {
    return this.http.put<T>(this.resolveUrl(endpoint), body, this.prepareOptions(options));
  }

  patch<T>(endpoint: string, body: unknown = {}, options?: HttpOptions): Observable<T> {
    return this.http.patch<T>(this.resolveUrl(endpoint), body, this.prepareOptions(options));
  }

  delete<T>(endpoint: string, options?: HttpOptions): Observable<T> {
    return this.http.delete<T>(this.resolveUrl(endpoint), this.prepareOptions(options));
  }

  resolveUrl(endpoint: string): string {
    if (/^https?:\/\//i.test(endpoint)) {
      return endpoint;
    }

    const base = (this.config.baseUrl || '').replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');

    return base ? `${base}/${path}` : `/${path}`;
  }

  private prepareOptions(options?: HttpOptions): {
    headers?: HttpHeaders | Record<string, string | string[]>;
    params?: HttpParams;
    context?: HttpOptions['context'];
    withCredentials?: boolean;
  } {
    if (!options) return {};

    return {
      headers: options.headers,
      params: options.params ? this.buildParams(options.params) : undefined,
      context: options.context,
      withCredentials: options.withCredentials,
    };
  }

  private buildParams(params: QueryParamsType): HttpParams {
    if (params instanceof HttpParams) {
      return params;
    }

    let httpParams = new HttpParams();

    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === undefined) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== null && item !== undefined) {
            httpParams = httpParams.append(key, String(item));
          }
        }
      } else {
        httpParams = httpParams.set(key, String(value));
      }
    }

    return httpParams;
  }
}
