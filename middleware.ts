import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // ১. অ্যাডমিন লগইন পেজে ঢুকতে দিতে হবে
  if (pathname === "/admin/login") {
    if (token && token.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // ২. টোকেন না থাকলে
  if (!token) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ৩. কাস্টমার যদি /admin এ ঢুকতে চায়, তবে তাকে /admin/login এ পাঠাবে
  if (pathname.startsWith("/admin") && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // ৪. ভেন্ডর পেজের জন্য
  if (pathname.startsWith("/vendor") && token.role !== "VENDOR" && token.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/dashboard/:path*"],
};