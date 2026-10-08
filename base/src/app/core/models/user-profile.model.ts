export interface UserProfileResponse {
  content?: Array<{
    CODIGOUSUARIO?: string;
    NOMBRE?: string;
    IDENTIFICACION?: string;
    NOMBREROLES?: string | string[];
    [key: string]: unknown;
  }>;
}