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
  token?: string;
  refreshToken?: string;
  user?: UserSession;
  message?: string;
  [key: string]: unknown;
}

export interface AuthConfig {
  loginUrl?: string;
  tokenName?: string;
  defaultRedirectUrl?: string;
  loginRedirectUrl?: string;
  refreshUrl?: string;
  enableRefreshToken?: boolean;
  forbiddenRedirectUrl?: string;
}
