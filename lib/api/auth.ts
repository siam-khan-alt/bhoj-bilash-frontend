import type { User } from "@/types";
import { mockUsers } from "@/lib/mocks/users";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function getStoredUsers(): (User & { password: string })[] {
  if (typeof window === "undefined") return [...mockUsers];
  const saved = localStorage.getItem("mock_users");
  if (saved) {
    try {
      const stored = JSON.parse(saved) as (User & { password: string })[];
      // reset old cache if it still has super_admin/customer/staff roles
      const valid = stored.every((u) => u.role === "admin" || u.role === "cashier");
      if (!valid) {
        localStorage.setItem("mock_users", JSON.stringify(mockUsers));
        return [...mockUsers];
      }
      return stored;
    } catch {
      return [...mockUsers];
    }
  }
  localStorage.setItem("mock_users", JSON.stringify(mockUsers));
  return [...mockUsers];
}

export async function login(data: { email: string; password: string }): Promise<{ user: User; token: string }> {
  await delay();
  const users = getStoredUsers();
  const found = users.find((u) => u.email === data.email && u.password === data.password);
  if (!found) throw new Error("err.invalidLogin");
  const { password: _pw, ...user } = found;
  const token = `mock-jwt-${Date.now()}-${user._id}`;
  return { user, token };
}

export function getStoredAuthUser(): User | null {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("user");
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}
