import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function OrderPage({ params, searchParams }: any) {
  const u = (await getSession())?.user as any;
  const o = await db.order.findUnique({ where: { id: params.id }, include: { items: { include: { product: true } } } });
  if (!o || (o.userId !== u.id && u.role !== "ADMIN")) notFound();
  return (
    <main className="wrap" style={{ maxWidth: 560, paddingTop: 40 }}>
      <h2>Order {o.status === "CANCELLED" ? "cancelled" : "placed"}</h2>
      <p><span className="pill">{o.status}</span> · {o.method} · ৳{o.total}</p>
      {searchParams.payment && <p style={{ color: "var(--chili)" }}>Payment {searchParams.payment}. You can order again from your bag.</p>}
      {o.items.map((i) => <p key={i.id}>{i.qty} × {i.product.title}</p>)}
    </main>
  );
}
