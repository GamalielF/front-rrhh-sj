import { AppEnvironment } from './env.model';

/**
 * Servidor de TEST de la cooperativa. Todo está en el mismo servidor (pre-prod.coopsanjose.fin.ec): el front, el backend de roles de
 * pago y el autenticador. Para el navegador es UN SOLO origen, así que no hay problemas de CORS entre ellos.
 * La imagen de Docker usa este archivo en lugar de env.dev (ver el Dockerfile). Se llama «pruebas» y no «test» porque
 * un archivo *.test.ts lo toma el ejecutor de pruebas por una prueba.
 */
export const env: AppEnvironment = {
  production: false,
  enableDebugLogin: false,
  loginUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/login',
  mfaVerifyUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/mfa/verify',
  refreshUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/refresh',
  apiBaseUrl: 'https://proxy.coopsanjose.fin.ec:8443/api/v1/analitics/',
  userProfileUrl: 'https://proxy.coopsanjose.fin.ec:8443/api/v1/analitics/Usuarios/busca-usuario',
  rolesPagoApiUrl: 'https://pre-prod.coopsanjose.fin.ec/rrhh-roll-administration/',
  mesesFuturosPermitidos: 12,
};
