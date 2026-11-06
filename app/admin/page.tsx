import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  const user = session?.user as any;

  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const vendors = await db.vendor.findMany({ include: { user: true } });
  const orders = await db.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>Vendors</h1>
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px", marginBottom: "40px" }}>
        {vendors.map((v) => (
          <div key={v.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #ddd" }}>
            <span>{v.shopName}</span>
            <span>{v.user.email}</span>
          </div>
        ))}
      </div>

      <h1 style={{ fontSize: "2.5rem", marginBottom: "20px" }}>All Orders</h1>
      <div style={{ background: "#f9f9f9", padding: "20px", borderRadius: "10px" }}>
        {orders.length === 0 ? (
          <p>No orders yet.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} style={{ borderBottom: "1px solid #ddd", padding: "15px 0" }}>
              <p><strong>Order ID:</strong> {o.id}</p>
              <p><strong>Customer:</strong> {o.user.name || o.user.email}</p>
              <p><strong>Total:</strong> ৳{o.total} | <strong>Status:</strong> {o.status} | <strong>Method:</strong> {o.method}</p>
              <p><strong>Items:</strong> {o.items.map((i: any) => `${i.qty}x ${i.product.title}`).join(", ")}</p>
            </div>
          ))
        )}
      </div>
    </main>
  );
}