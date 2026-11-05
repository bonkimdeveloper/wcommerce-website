import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validate } from "@/lib/sslcommerz";

// SSLCommerz POSTs here for success | fail | cancel | ipn
export async function POST(req: NextRequest, { params }: { params: { result: string } }) {
  const f = await req.formData();
  const tranId = String(f.get("tran_id") || "");
  const order = await db.order.findUnique({ where: { tranId } });
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);
  if (!order) return go("/");

  if (params.result === "success" || params.result === "ipn") {
    const v = await validate(String(f.get("val_id")));
    if (v.ok && v.tranId === tranId && v.amount === order.total) {
      if (order.status === "PENDING") await db.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      return params.result === "ipn" ? NextResponse.json({ ok: true }) : go(`/orders/${order.id}`);
    }
    return go(`/orders/${order.id}?payment=invalid`);
  }
  if (params.result === "cancel" || params.result === "fail")
    await db.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  return go(`/orders/${order.id}?payment=${params.result}`);
}
