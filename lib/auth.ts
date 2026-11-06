import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", // ডিফল্ট পেজ বন্ধ করে হোমপেজের মডালে পাঠাবে
  },
  providers: [
    CredentialsProvider({
      name: "Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        // ১. অ্যাডমিন লগইন (admin@gmail.com / admin123)
        if (credentials.email === "admin@gmail.com" && credentials.password === "admin123") {
          let user = await db.user.findUnique({ where: { email: "admin@gmail.com" } });
          if (!user) {
            user = await db.user.create({
              data: { email: "admin@gmail.com", name: "Admin", role: "ADMIN" }
            });
          }
          return { id: user.id, name: user.name, email: user.email, role: "ADMIN" } as any;
        }

        // ২. কাস্টমার টেস্টিং লগইন (যেকোনো ইমেইল / পাসওয়ার্ড: 123)
        if (credentials.password === "123") {
          let user = await db.user.findUnique({ where: { email: credentials.email } });
          if (!user) {
            user = await db.user.create({
              data: { email: credentials.email, name: credentials.email.split("@")[0], role: "CUSTOMER" }
            });
          }
          return { id: user.id, name: user.name, email: user.email, role: "CUSTOMER" } as any;
        }

        return null;
      }
    }),
    GoogleProvider({ clientId: process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.GOOGLE_CLIENT_SECRET!, allowDangerousEmailAccountLinking: true }),
    EmailProvider({ server: process.env.EMAIL_SERVER, from: process.env.EMAIL_FROM }),
  ],
  events: {
    async createUser({ user }) {
      if (user.email && user.email === process.env.ADMIN_EMAIL)
        await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = user.id;
      }
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