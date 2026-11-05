import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import CredentialsProvider from "next-auth/providers/credentials"; // নতুন যোগ করা হলো
import { db } from "./db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  providers: [
    // ১. নতুন ম্যানুয়াল অ্যাডমিন লগইন
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@gmail.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // এখানে আপনার ইচ্ছেমতো ইমেইল এবং পাসওয়ার্ড সেট করুন
        if (credentials?.email === "admin@gmail.com" && credentials?.password === "admin123") {
          // ডাটাবেসে ইউজারটি আছে কিনা চেক করা, না থাকলে তৈরি করা
          let user = await db.user.findUnique({ where: { email: "admin@gmail.com" } });
          if (!user) {
            user = await db.user.create({
              data: {
                email: "admin@gmail.com",
                name: "Admin",
                role: "ADMIN",
              }
            });
          } else if (user.role !== "ADMIN") {
            user = await db.user.update({
              where: { email: "admin@gmail.com" },
              data: { role: "ADMIN" }
            });
          }
          return { id: user.id, name: user.name, email: user.email, role: "ADMIN" } as any;
        }
        return null;
      }
    }),
    
    // ২. আপনার আগের Google ও Email লগইন
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
        token.role = (user as any).role; // Credentials Login থেকে রোল নেওয়া
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
  pages: {
    // আপনার লগইন পেজটি কোথায় আছে সেই পাথটি দিন, যদি কাস্টম পেজ থাকে
    // signIn: '/login', 
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireRole(...roles: string[]) {
  const s = await getSession();
  const u = s?.user as any;
  if (!u || !roles.includes(u.role)) throw new Error("Forbidden");
  return u as { id: string; role: string; email: string };
}