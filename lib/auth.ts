import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { consumeRateLimit, normalizeBdPhone } from "./security";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as any,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/" },
  providers: [
    CredentialsProvider({
      name: "Phone Login",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const phone = normalizeBdPhone(credentials?.phone);
        const password = credentials?.password || "";
        if (!phone || !password || password.length > 72) return null;
        if (!consumeRateLimit(`login:phone:${phone}`, 8, 15 * 60 * 1000)) return null;
        const user = await db.user.findUnique({ where: { phone } });
        if (!user?.password || !(await bcrypt.compare(password, user.password))) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.role = (user as any).role; token.uid = user.id; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) { (session.user as any).role = token.role; (session.user as any).id = token.uid; }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireRole(...roles: string[]) {
  const session = await getSession();
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) throw new Error("Unauthorized");
  const user = await db.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, role: true, email: true, phone: true, name: true },
  });
  if (!user || !roles.includes(user.role)) throw new Error("Forbidden");
  return user;
}

export async function requireApprovedVendor() {
  const user = await requireRole("VENDOR");
  const vendor = await db.vendor.findUnique({ where: { userId: user.id } });
  if (!vendor || !vendor.approved) throw new Error("Vendor approval required");
  return { user, vendor };
}
