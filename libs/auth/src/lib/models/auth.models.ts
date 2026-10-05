export interface LoginCredentials {
  username?: string;
  password?: string;
}

export interface UserSession {
  id?: string | number;
  username: string;
  name?: string;
  email?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface LoginResponse {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
  user?: UserSession;
  otpauthUrl?: string;
  message?: string;
  [key: string]: unknown;
}

export interface AuthConfig {
  loginUrl: string;
  mfaVerifyUrl: string;
  tokenName?: string;
  defaultRedirectUrl?: string;
  loginRedirectUrl?: string;
  refreshUrl?: string;
  enableRefreshToken?: boolean;
  forbiddenRedirectUrl?: string;
}
