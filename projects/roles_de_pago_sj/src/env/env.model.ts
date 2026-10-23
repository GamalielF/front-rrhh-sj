export interface AppEnvironment {
  production: boolean;
  enableDebugLogin: boolean;
  loginUrl: string;
  mfaVerifyUrl: string;
  refreshUrl: string;
  apiBaseUrl: string;
  userProfileUrl: string;
}
