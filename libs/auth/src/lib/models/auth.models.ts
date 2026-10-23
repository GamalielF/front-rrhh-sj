import { Observable } from 'rxjs';

export interface LoginCredentials {
  username?: string;
  password?: string;
  [key: string]: unknown;
}

export interface UserSession {
  id?: string | number;
  username: string;
  name?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface LoginResponse<TUser extends UserSession = UserSession> {
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  refreshToken?: string;
  user?: TUser;
  otpauthUrl?: string;
  message?: string;
  [key: string]: unknown;
}

export type TokenStorageType = 'localStorage' | 'sessionStorage' | 'memory' | 'cookie';
export type RefreshMode = 'cookie' | 'body';

export interface AuthConfig {
  loginUrl: string;
  mfaVerifyUrl: string;
  tokenName?: string;
  usernameClaim?: string | string[];
  defaultRedirectUrl?: string;
  loginRedirectUrl?: string;
  forbiddenRedirectUrl?: string;
  refreshUrl?: string;
  enableRefreshToken?: boolean;
  refreshMode?: RefreshMode;
  withCredentials?: boolean;
  tokenStorage?: TokenStorageType;
  persistUserInStorage?: boolean;
  enableDebugMode?: boolean;
}

export interface UserProfileLoader<TUser extends UserSession = UserSession> {
  loadProfile(context: {
    username?: string;
    token?: string;
    currentUser?: TUser | null;
  }): Observable<TUser | null>;
}
