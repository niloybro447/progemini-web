export function getDashboardPath(role?: string | null) {
  if (role === "ADMIN") return "/admin";
  return "/student";
}

export function sanitizeCallbackPath(
  callbackUrl?: string | null,
  fallback = "/student"
) {
  if (!callbackUrl) return fallback;

  if (callbackUrl.startsWith("/")) {
    return callbackUrl.startsWith("//") ? fallback : callbackUrl;
  }

  try {
    const url = new URL(callbackUrl);
    const appOrigin = new URL(
      process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXTAUTH_URL ||
        "https://progeminiacademy.com"
    ).origin;

    if (url.origin === appOrigin) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}