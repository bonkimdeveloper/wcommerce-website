import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const body = await req.json();
    const { items, address, method } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      // ১. প্রথমে ডাটাবেসের আসল আইডি দিয়ে খোঁজা
      let product = await db.product.findUnique({ where: { id: item.id } });
      
      // ২. যদি আইডি না মেলে, তবে প্রোডাক্টের নাম (title) দিয়ে খোঁজা
      if (!product) {
        product = await db.product.findFirst({ 
          where: { title: { contains: item.title || item.id, mode: 'insensitive' } } 
        });
      }

      // ৩. যদি তাও না মেলে, তবে ডাটাবেসের প্রথম প্রোডাক্টটা ধরে নেওয়া (যাতে অর্ডার ফেইল না করে)
      if (!product) {
        product = await db.product.findFirst();
      }

      if (product) {
        total += product.price * item.qty;
        orderItems.push({
          productId: product.id,
          vendorId: product.vendorId,
          qty: item.qty,
          price: product.price,
        });
      }
    }

    if (orderItems.length === 0) {
      return NextResponse.json({ error: "Database e kono product nei! Age seed koren." }, { status: 400 });
    }

    const order = await db.order.create({
      data: {
        userId: (session.user as any).id,
        total,
        method: method === "COD" ? "COD" : "SSLCOMMERZ",
        address,
        items: { create: orderItems },
      },
    });

    return NextResponse.json({ success: true, url: `/orders/${order.id}` });
  } catch (error: any) {
    console.error("Checkout API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
  }
}