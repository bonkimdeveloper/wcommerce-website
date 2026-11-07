import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const DELIVERY_FEE = 60;

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { items, address, method, senderNumber, trxId } = body;

    // ── Validate cart
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // ── Validate address
    if (
      !address ||
      !address.fullName ||
      !address.phone ||
      !address.area ||
      !address.address
    ) {
      return NextResponse.json({ error: "Address incomplete" }, { status: 400 });
    }

    // ── Validate method
    const payMethod = String(method || "").toUpperCase();
    const validMethods = ["BKASH", "NAGAD", "COD"];
    if (!validMethods.includes(payMethod)) {
      return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
    }

    if (payMethod !== "COD") {
      if (!senderNumber || !trxId) {
        return NextResponse.json(
          { error: "Sender number এবং TrxID লাগবে" },
          { status: 400 }
        );
      }
    }

    // ── Get default commission rate
    const commissionSetting = await db.setting.findUnique({
      where: { key: "commission_rate" },
    });
    const defaultRate = commissionSetting
      ? parseFloat(commissionSetting.value)
      : 5;

    // ── Look up products by title (homepage sends title as id)
    const titles = items.map((i: any) => i.title || i.id).filter(Boolean);
    const products = await db.product.findMany({
      where: { title: { in: titles }, active: true },
      include: { vendor: true },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: "কোনো matching product পাওয়া যায়নি" },
        { status: 400 }
      );
    }

    // ── Build order items with strict matching (no random fallback!)
    const orderItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const title = item.title || item.id;
      const qty = Number(item.qty || item.q || 1);
      const product = products.find((p) => p.title === title);

      if (!product) continue; // skip unknown

      if (product.stock < qty) {
        return NextResponse.json(
          {
            error: `"${product.title}" stock কম (available: ${product.stock})`,
          },
          { status: 400 }
        );
      }

      const rate = product.vendor.commission ?? defaultRate;
      const lineTotal = product.price * qty;
      const commissionAmount = Math.round((lineTotal * rate) / 100);
      const vendorEarning = lineTotal - commissionAmount;

      subtotal += lineTotal;
      orderItems.push({
        productId: product.id,
        vendorId: product.vendorId,
        productTitle: product.title,
        qty,
        price: product.price,
        commissionRate: rate,
        commissionAmount,
        vendorEarning,
      });
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "Cart-এ valid product নেই" },
        { status: 400 }
      );
    }

    const total = subtotal + DELIVERY_FEE;
    const isCOD = payMethod === "COD";
    const orderNumber =
      "KHB-" + Date.now().toString(36).toUpperCase().slice(-8);

    // ── Transaction: create order + payment + deduct stock + pending balance
    const order = await db.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          orderNumber,
          userId,
          subtotal,
          deliveryFee: DELIVERY_FEE,
          total,
          method: payMethod as any,
          paymentStatus: isCOD ? "UNPAID" : "PENDING_VERIFICATION",
          status: "PENDING",
          address,
          items: { create: orderItems },
        },
      });

      await tx.payment.create({
        data: {
          orderId: o.id,
          method: payMethod as any,
          amount: total,
          status: isCOD ? "UNPAID" : "PENDING_VERIFICATION",
          senderNumber: senderNumber || null,
          trxId: trxId || null,
        },
      });

      // Deduct stock
      for (const oi of orderItems) {
        await tx.product.update({
          where: { id: oi.productId },
          data: { stock: { decrement: oi.qty } },
        });
      }

      // Aggregate per vendor
      const byVendor: Record<
        string,
        { earning: number; commission: number; rate: number }
      > = {};
      for (const oi of orderItems) {
        if (!byVendor[oi.vendorId]) {
          byVendor[oi.vendorId] = {
            earning: 0,
            commission: 0,
            rate: oi.commissionRate,
          };
        }
        byVendor[oi.vendorId].earning += oi.vendorEarning;
        byVendor[oi.vendorId].commission += oi.commissionAmount;
      }

      for (const [vendorId, agg] of Object.entries(byVendor)) {
        await tx.vendorBalance.upsert({
          where: { vendorId },
          update: { pending: { increment: agg.earning } },
          create: {
            vendorId,
            pending: agg.earning,
            available: 0,
            totalEarned: 0,
          },
        });

        await tx.commission.create({
          data: {
            orderId: o.id,
            vendorId,
            rate: agg.rate,
            amount: agg.commission,
            isSettled: false,
          },
        });
      }

      return o;
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      total,
      message: isCOD
        ? "Order placed. Delivery-তে cash দিন।"
        : "Order placed. Admin TrxID verify করবেন।",
    });
  } catch (error: any) {
    console.error("❌ Checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Order তৈরি করতে ব্যর্থ" },
      { status: 500 }
    );
  }
}