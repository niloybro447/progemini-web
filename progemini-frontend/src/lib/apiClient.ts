import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

interface RequestOptions extends RequestInit {
  json?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { json, ...fetchOptions } = options;
  const headers: Record<string, string> = {
    ...(fetchOptions.headers as Record<string, string>),
  };

  // Automatically attach Bearer token from NextAuth session
  try {
    const session = await getSession();
    const token = (session as any)?.accessToken;
    if (token && !headers["Authorization"]) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  } catch {
    // Session retrieval skipped in non-client context
  }

  if (json !== undefined) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(json);
  }

  fetchOptions.credentials = "include";
  fetchOptions.headers = headers;

  // Normalize endpoint to prevent double /api
  let cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  if (cleanEndpoint.startsWith("/api/")) {
    cleanEndpoint = cleanEndpoint.replace(/^\/api/, "");
  }

  const res = await fetch(`${API_BASE}${cleanEndpoint}`, fetchOptions);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    const message = error.error?.message || error.message || error.error || `API Error ${res.status}`;
    throw new Error(message);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, json?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", json }),

  put: <T>(endpoint: string, json?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PUT", json }),

  patch: <T>(endpoint: string, json?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "PATCH", json }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  upload: <T>(endpoint: string, formData: FormData, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "POST", body: formData }),
};
