import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withNoHttpTransferCache } from '@angular/platform-browser';
import { authInterceptor, provideAuth } from '@lumen/auth';
import { provideHttp } from '@lumen/http';
import { routes } from './app.routes';
import { environment } from '@environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules)
    ),
    provideClientHydration(withNoHttpTransferCache()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideHttp({
      baseUrl: environment.apiBaseUrl,
    }),
    provideAuth({
      loginUrl: environment.loginUrl,
      defaultRedirectUrl: '/home',
      loginRedirectUrl: '/login',
    }),
  ],
};
