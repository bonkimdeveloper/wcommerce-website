import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { name, phone, avatar } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: "Name and phone are required" }, { status: 400 });
    }

    // ফোন নম্বরটি অন্য কেউ ব্যবহার করছে কিনা চেক করা
    const existing = await db.user.findUnique({ where: { phone } });
    if (existing && existing.id !== userId) {
      return NextResponse.json({ error: "This phone number is already in use" }, { status: 400 });
    }

    await db.user.update({
      where: { id: userId },
      data: { name, phone, image: avatar },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("❌ Profile Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}