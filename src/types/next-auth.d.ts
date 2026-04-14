import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId: string | null;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    tenantId: string | null;
    role: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    tenantId?: string | null;
    role?: string;
  }
}

export {};
