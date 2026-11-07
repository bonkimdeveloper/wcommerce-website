import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body; // "VERIFY", "SHIP", "DELIVER"

    const order = await db.order.findUnique({
      where: { id: params.id },
      include: { items: true, payment: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (action === "VERIFY") {
      // ১. পেমেন্ট পেইড মার্ক করা
      await db.payment.update({
        where: { orderId: order.id },
        data: { status: "PAID", verifiedBy: (session.user as any).id, verifiedAt: new Date() },
      });
      // ২. অর্ডার কনফার্ম করা
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "PAID", status: "CONFIRMED" },
      });
    } 
    
    else if (action === "SHIP") {
      await db.order.update({
        where: { id: order.id },
        data: { status: "SHIPPED" },
      });
    } 
    
    else if (action === "DELIVER") {
      await db.$transaction(async (tx) => {
        // ১. অর্ডার ডেলিভারড মার্ক করা
        await tx.order.update({
          where: { id: order.id },
          data: { status: "DELIVERED" },
        });

        // ২. ভেন্ডরের pending থেকে available-এ টাকা নেওয়া
        for (const item of order.items) {
          await tx.vendorBalance.update({
            where: { vendorId: item.vendorId },
            data: {
              pending: { decrement: item.vendorEarning },
              available: { increment: item.vendorEarning },
              totalEarned: { increment: item.vendorEarning },
            },
          });
        }
      });
    }

    return NextResponse.json({ success: true, message: "Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}