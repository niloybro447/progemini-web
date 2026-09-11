import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      role: string;
      avatar?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    avatar?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    avatar?: string | null;
    accessToken?: string;
  }
}
