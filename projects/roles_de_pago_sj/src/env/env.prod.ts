import { AppEnvironment } from './env.model';

export const env: AppEnvironment = {
  production: true,
  enableDebugLogin: false,
  loginUrl: 'https://serviciossj.coopsanjose.fin.ec:443/api/auth/login',
  mfaVerifyUrl: 'https://serviciossj.coopsanjose.fin.ec:443/api/auth/mfa/verify',
  refreshUrl: 'https://serviciossj.coopsanjose.fin.ec:443/api/auth/refresh',
  apiBaseUrl: 'https://serviciossj.coopsanjose.fin.ec:443/api/v1/analitics/',
  userProfileUrl: 'https://serviciossj.coopsanjose.fin.ec:443/api/v1/analitics/Usuarios/busca-usuario',
  rolesPagoApiUrl: 'https://DOMINIO-DEL-BACKEND/api/v1/roles-pago/',
  mesesFuturosPermitidos: 1,
};
