import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, allowDangerousEmailAccountLinking: true }),
    EmailProvider({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }),
  ],
  events: {
    // first login with ADMIN_EMAIL becomes admin
    async createUser({ user }) {
      if (user.email && user.email === process.env.ADMIN_EMAIL)
        await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    },
  },
  callbacks: {
    async jwt({ token }) {
      if (token.email) {
        const u = await db.user.findUnique({ where: { email: token.email } });
        if (u) { token.role = u.role; token.uid = u.id; }
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).id = token.uid;
      return session;
    },
  },
};
export const getSession = () => getServerSession(authOptions);
export async function requireRole(...roles: string[]) {
  const s = await getSession();
  const u = s?.user as any;
  if (!u || !roles.includes(u.role)) throw new Error("Forbidden");
  return u as { id: string; role: string; email: string };
}
