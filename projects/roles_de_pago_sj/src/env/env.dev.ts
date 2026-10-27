import { AppEnvironment } from './env.model';

export const env: AppEnvironment = {
  production: false,
  enableDebugLogin: false,
  loginUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/login',
  mfaVerifyUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/mfa/verify',
  refreshUrl: 'https://pre-prod.coopsanjose.fin.ec/authenticator/api/v1/auth/refresh',
  apiBaseUrl: 'https://proxy.coopsanjose.fin.ec:8443/api/v1/analitics/',
  userProfileUrl: 'https://proxy.coopsanjose.fin.ec:8443/api/v1/analitics/Usuarios/busca-usuario',
  rolesPagoApiUrl: 'http://localhost:8080/api/v1/roles-pago/',
  mesesFuturosPermitidos: 12,
};
