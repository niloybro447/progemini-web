import { getServerSession } from "next-auth";
import { cache } from "react";
import { authOptions } from "./auth";

/**
 * Cached per-request session read.
 * React `cache()` deduplicates this across all Server Components in a single
 * render pass, so the DB/token round-trip only happens once per request even
 * if multiple layouts, pages and components each call getCurrentUser().
 */
export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
});

export const getSession = cache(async () => {
  return await getServerSession(authOptions);
});

export async function requireAuth(allowedRoles?: string[]) {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}
