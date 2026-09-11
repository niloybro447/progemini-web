import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const session = await getServerSession(authOptions);
  const accessToken = (session as any)?.accessToken;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      Cookie: cookieHeader,
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    const message = error.error?.message || error.message || `API Error ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
