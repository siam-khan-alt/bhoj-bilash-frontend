import type { User } from "@/types";
import { apiFetch } from "./client";

export async function login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
  return apiFetch<{ user: User; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
