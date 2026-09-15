import api from "./axiosInstance";
import type { AuthUser } from "@/types/api";

export type LoginPayload = { email: string; password: string };
export type RegisterPayload = { name: string; email: string; password: string; profileSlug: string };

export async function register(payload: RegisterPayload) {
  return api.post<{ message: string; user: AuthUser }>("/auth/signup", payload);
}

export async function login(payload: LoginPayload) {
  return api.post<{ message: string; token: string; user: AuthUser }>("/auth/login", payload);
}

export async function getCurrentUser() {
  return api.get<{ user: AuthUser }>("/auth/me");
}
