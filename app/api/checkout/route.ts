import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { initPayment } from "@/lib/sslcommerz";

export async function POST(req: NextRequest) {
  const s = await getSession();
  const user = s?.user as any;
  if (!user?.id) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  const { items, address, method } = await req.json();
  if (!items?.length || !address?.line || !address?.phone) return NextResponse.json({ error: "Missing details" }, { status: 400 });

  // prices always come from the DB, never from the browser
  const products = await db.product.findMany({ where: { id: { in: items.map((i: any) => i.id) }, active: true, vendor: { approved: true } } });
  const lines = items.map((i: any) => {
    const p = products.find((x) => x.id === i.id);
    if (!p) return null;
    return { productId: p.id, vendorId: p.vendorId, qty: Math.max(1, Math.min(50, +i.qty | 0)), price: p.price };
  }).filter(Boolean) as any[];
  if (!lines.length) return NextResponse.json({ error: "Items unavailable" }, { status: 400 });
  const total = lines.reduce((a, l) => a + l.price * l.qty, 0) + 60; // flat delivery fee

  const tranId = `KH${Date.now()}${Math.floor(Math.random() * 1e4)}`;
  const order = await db.order.create({
    data: { userId: user.id, total, method, address, tranId, items: { create: lines } },
  });
  if (method === "COD") return NextResponse.json({ url: `/orders/${order.id}` });
  try {
    const url = await initPayment({ tranId, total, name: user.name || "Customer", email: user.email, address: address.line, phone: address.phone, origin: req.nextUrl.origin });
    return NextResponse.json({ url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}
