import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { consumeRateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  const user = session?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Please login first." }, { status: 401 });
  if (!consumeRateLimit(`checkout:user:${user.id}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many checkout attempts. Please wait." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const itemsInput = body?.items;
    const address = body?.address;
    const method = body?.method;

    if (!Array.isArray(itemsInput) || itemsInput.length === 0 || itemsInput.length > 50) {
      return NextResponse.json({ error: "Cart must contain between 1 and 50 items." }, { status: 400 });
    }
    if (!address || typeof address !== "object" || Array.isArray(address)) {
      return NextResponse.json({ error: "A valid delivery address is required." }, { status: 400 });
    }
    const line = typeof address.line === "string" ? address.line.trim() : "";
    const phone = typeof address.phone === "string" ? address.phone.trim() : "";
    if (line.length < 5 || line.length > 500 || !/^((\\+?880)?0?1[3-9]\\d{8})$/.test(phone.replace(/[\\s()-]/g, ""))) {
      return NextResponse.json({ error: "Enter a valid delivery address and Bangladesh phone number." }, { status: 400 });
    }
    if (!["COD", "BKASH", "NAGAD", "SSLCOMMERZ"].includes(method)) {
      return NextResponse.json({ error: "Unsupported payment method." }, { status: 400 });
    }

    const quantities = new Map<string, number>();
    for (const item of itemsInput) {
      if (!item || typeof item.id !== "string" || item.id.length > 100 || !Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 99) {
        return NextResponse.json({ error: "Cart contains an invalid product or quantity." }, { status: 400 });
      }
      const nextQty = (quantities.get(item.id) || 0) + item.qty;
      if (nextQty > 99) return NextResponse.json({ error: "Maximum quantity per product is 99." }, { status: 400 });
      quantities.set(item.id, nextQty);
    }

    const ids = Array.from(quantities.keys());
    const products = await db.product.findMany({
      where: { id: { in: ids }, active: true, vendor: { approved: true } },
      select: { id: true, vendorId: true, price: true, stock: true },
    });
    if (products.length !== ids.length) {
      return NextResponse.json({ error: "One or more products are unavailable. Refresh your cart." }, { status: 400 });
    }

    let total = 0;
    const orderItems = products.map((product) => {
      const qty = quantities.get(product.id)!;
      if (product.stock < qty) throw new Error("INSUFFICIENT_STOCK");
      total += product.price * qty;
      return { productId: product.id, vendorId: product.vendorId, qty, price: product.price };
    });
    if (!Number.isSafeInteger(total) || total < 1) {
      return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
    }

    const order = await db.$transaction(async (tx) => {
      for (const item of orderItems) {
        const stock = await tx.product.updateMany({
          where: { id: item.productId, active: true, stock: { gte: item.qty }, vendor: { approved: true } },
          data: { stock: { decrement: item.qty } },
        });
        if (stock.count !== 1) throw new Error("INSUFFICIENT_STOCK");
      }
      return tx.order.create({
        data: {
          userId: user.id,
          total,
          method,
          address: { line, phone },
          items: { create: orderItems },
        },
        select: { id: true, total: true, status: true },
      });
    });

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error: any) {
    if (error?.message === "INSUFFICIENT_STOCK") {
      return NextResponse.json({ error: "Some products no longer have enough stock." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create your order. Please try again." }, { status: 500 });
  }
}
