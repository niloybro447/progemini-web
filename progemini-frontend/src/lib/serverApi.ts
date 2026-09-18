import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export async function serverFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  let cookieHeader = "";
  try {
    const cookieStore = cookies();
    cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");
  } catch {
    // cookies() unavailable in some static build contexts
  }

  let accessToken: string | undefined;
  try {
    const session = await getServerSession(authOptions);
    accessToken = (session as any)?.accessToken;
  } catch {
    // session unavailable
  }

  // Normalize endpoint to prevent double /api
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  const res = await fetch(`${API_BASE}${cleanEndpoint}`, {
    ...options,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...options?.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    const message = error.error?.message || error.message || error.error || `API Error ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
