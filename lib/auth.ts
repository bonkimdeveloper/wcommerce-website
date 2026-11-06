import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/", 
  },
  providers: [
    CredentialsProvider({
      name: "Phone Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" } 
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) return null;

        let user = await db.user.findUnique({ where: { phone: credentials.phone } });

        // ইউজার না থাকলে নতুন তৈরি হবে (Sign Up)
        if (!user) {
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await db.user.create({
            data: {
              phone: credentials.phone,
              password: hashedPassword,
              name: "User " + credentials.phone.slice(-4),
              role: credentials.role === "VENDOR" ? "VENDOR" : "CUSTOMER",
            }
          });

          // Seller হলে ভেন্ডর প্রোফাইল তৈরি
          if (credentials.role === "VENDOR") {
            await db.vendor.create({
              data: {
                userId: user.id,
                shopName: "My Shop " + credentials.phone.slice(-4),
              }
            });
          }
        } else {
          // ইউজার থাকলে পাসওয়ার্ড চেক
          if (!user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;
        }

        return { id: user.id, name: user.name, phone: user.phone, role: user.role } as any;
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = user.id;
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