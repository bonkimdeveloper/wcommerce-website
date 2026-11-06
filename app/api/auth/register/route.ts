import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { consumeRateLimit, normalizeBdPhone } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";

  if (!consumeRateLimit(`register:ip:${ip}`, 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many registration attempts. Try again later." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const phone = normalizeBdPhone(body?.phone);
    const password = typeof body?.password === "string" ? body.password : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!phone) {
      return NextResponse.json({ error: "Enter a valid Bangladesh mobile number." }, { status: 400 });
    }
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: "Password must be between 8 and 72 characters." }, { status: 400 });
    }
    if (name.length > 80) {
      return NextResponse.json({ error: "Name is too long." }, { status: 400 });
    }
    if (!consumeRateLimit(`register:phone:${phone}`, 3, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many attempts for this phone number. Try again later." }, { status: 429 });
    }

    const existing = await db.user.findUnique({ where: { phone }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        phone,
        password: hashedPassword,
        name: name || `User ${phone.slice(-4)}`,
        role: "CUSTOMER",
      },
      select: { id: true, name: true, phone: true, role: true },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "An account with this phone number already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Registration could not be completed. Please try again." }, { status: 500 });
  }
}
