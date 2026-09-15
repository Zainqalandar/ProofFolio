const TOKEN_COOKIE = "token";
const AUTH_CHANGE_EVENT = "prooffolio-auth-change";

function notifyAuthChange(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function setAuthToken(token: string, rememberMe = false): void {
  if (typeof document === "undefined") return;
  const maxAge = rememberMe ? "; Max-Age=2592000" : "";
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; SameSite=Lax${maxAge}${secure}`;
  notifyAuthChange();
}

export function getAuthToken(): string | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie.split("; ").find((entry) => entry.startsWith(`${TOKEN_COOKIE}=`));
  return cookie ? decodeURIComponent(cookie.slice(`${TOKEN_COOKIE}=`.length)) : null;
}

export function clearAuthToken(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  notifyAuthChange();
}

export function subscribeToAuthChanges(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(AUTH_CHANGE_EVENT, callback);
  return () => window.removeEventListener(AUTH_CHANGE_EVENT, callback);
}

export function hasAuthToken(): boolean {
  return Boolean(getAuthToken());
}
