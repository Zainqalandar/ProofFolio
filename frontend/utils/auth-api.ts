import api from "./axiosInstance";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { username: string; email: string; password: string; profileSlug: string };
export type AuthUser = { _id: string; username: string; email: string; bio?: string; profileSlug: string };

export async function register(payload: RegisterPayload) {
  return api.post<{ message: string }>("/auth/register", payload);
}

export async function login(payload: LoginPayload) {
  return api.post<{ message: string; token: string }>("/auth/login", payload);
}

export async function getCurrentUser() {
  return api.get<{ user: AuthUser }>("/auth/me");
}
