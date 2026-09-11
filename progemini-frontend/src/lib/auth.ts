import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { normalizeEmail } from "./authNavigation";

// Password validation with complexity requirements
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export const authOptions: NextAuthOptions = {
  debug: process.env.NEXTAUTH_DEBUG === "true",
  useSecureCookies: process.env.NODE_ENV === "production", // HTTPS only in production
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.error("[AUTH] Missing credentials");
          throw new Error("Invalid credentials");
        }

        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
          const res = await fetch(`${API_BASE}/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: normalizeEmail(credentials.email),
              password: credentials.password,
            }),
          });
          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error?.message || data.error || 'Login failed');
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            avatar: data.user.avatar,
            accessToken: data.accessToken,
          };
        } catch (error: any) {
          console.error("[AUTH] Authorization error:", error);
          throw new Error(error.message || "Login failed");
        }
      }
    })
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow redirects to the same URL
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allow redirects to same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
        token.iat = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session as any).accessToken = token.accessToken;
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.avatar = token.avatar as string | null;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours (reduced from 30 days for security)
    updateAge: 60 * 60, // Update session every hour
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.progemini.academy' : undefined,
      }
    },
    callbackUrl: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    csrfToken: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    },
    pkceCodeVerifier: {
      name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.pkce.code_verifier`,
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log(`[AUTH_EVENT] User signed in: ${user?.email}`);
    },
    async signOut({ token }) {
      console.log(`[AUTH_EVENT] User signed out`);
    },
  },
};
