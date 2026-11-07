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
        role: { label: "Role", type: "text" },
      },

      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null;
        }

        const phone = credentials.phone.trim();

        try {
          let user = await db.user.findUnique({
            where: { phone },
          });

          if (!user) {
            const role =
              credentials.role === "VENDOR" ? "VENDOR" : "CUSTOMER";

            const hashedPassword = await bcrypt.hash(
              credentials.password,
              10
            );

            user = await db.user.create({
              data: {
                phone,
                password: hashedPassword,
                name: "User " + phone.slice(-4),
                role,
              },
            });

            if (role === "VENDOR") {
              await db.vendor.create({
                data: {
                  userId: user.id,
                  shopName: "My Shop " + phone.slice(-4),
                },
              });
            }
          } else {
            if (!user.password) return null;

            const isValid = await bcrypt.compare(
              credentials.password,
              user.password
            );

            if (!isValid) return null;
          }

          return {
            id: user.id,
            name: user.name,
            phone: user.phone,
            role: user.role,
            image: user.image, // ইমেজ সেশনে পাঠানো হলো
          } as any;
        } catch (error: any) {
          console.error("❌ AUTHORIZE ERROR:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.uid = user.id;
        token.phone = (user as any).phone;
        token.image = (user as any).image;
      }
      
      // যদি প্রোফাইল আপডেট হয়, তবে সেশনেও আপডেট হবে
      if (trigger === "update" && session) {
        token.name = session.name;
        token.phone = session.phone;
        token.image = session.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.uid;
        (session.user as any).phone = token.phone;
        (session.user as any).image = token.image;
        session.user.name = token.name;
      }
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireRole(...roles: string[]) {
  const session = await getSession();
  const user = session?.user as any;

  if (!user || !roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}