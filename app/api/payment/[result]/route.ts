import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validate } from "@/lib/sslcommerz";

// Gateway callbacks are intentionally unauthenticated, but every success is validated server-to-server.
export async function POST(req: NextRequest, { params }: { params: { result: string } }) {
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url), 303);

  try {
    const form = await req.formData();
    const tranId = String(form.get("tran_id") || "").trim();
    if (!tranId || tranId.length > 100) return go("/?payment=invalid");

    const order = await db.order.findUnique({ where: { tranId } });
    if (!order) return go("/?payment=not-found");

    if (params.result === "success" || params.result === "ipn") {
      const valId = String(form.get("val_id") || "").trim();
      if (!valId) return params.result === "ipn" ? NextResponse.json({ ok: false }, { status: 400 }) : go(`/orders/${order.id}?payment=invalid`);

      const validation = await validate(valId);
      const valid = validation.ok && validation.tranId === tranId && validation.amount === order.total && validation.currency === "BDT";
      if (!valid) {
        return params.result === "ipn" ? NextResponse.json({ ok: false }, { status: 400 }) : go(`/orders/${order.id}?payment=invalid`);
      }

      if (order.status === "PENDING") {
        await db.order.updateMany({
          where: { id: order.id, status: "PENDING", tranId },
          data: { status: "PAID" },
        });
      }
      return params.result === "ipn" ? NextResponse.json({ ok: true }) : go(`/orders/${order.id}`);
    }

    // Fail/cancel POSTs are not cryptographically authoritative; never mutate order state from them.
    if (params.result === "cancel" || params.result === "fail") {
      return go(`/orders/${order.id}?payment=${params.result}`);
    }
    return go(`/orders/${order.id}`);
  } catch {
    return go("/?payment=callback-error");
  }
}
