export function decodeJwt<T = Record<string, unknown>>(token: string): T | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

export function getClaimFromToken(token: string, claim: string | string[]): string | null {
  const payload = decodeJwt<Record<string, unknown>>(token);
  if (!payload) return null;
  const claims = Array.isArray(claim) ? claim : [claim];
  for (const c of claims) {
    const val = payload[c];
    if (typeof val === 'string' && val) return val;
  }
  return null;
}

export function isTokenExpired(token: string, bufferSeconds = 0): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload?.exp) return false;
  return Date.now() / 1000 >= payload.exp - bufferSeconds;
}
