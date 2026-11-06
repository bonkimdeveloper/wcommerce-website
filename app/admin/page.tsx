import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole("ADMIN");
  const vendors = await db.vendor.findMany({ include: { user: true }, orderBy: { shopName: "asc" } });
  const orders = await db.order.findMany({ include: { user: true, items: { include: { product: true } } }, orderBy: { createdAt: "desc" } });

  async function approveVendor(formData: FormData) {
    "use server";
    await requireRole("ADMIN");
    const vendorId = String(formData.get("vendorId") || "");
    const vendor = await db.vendor.findUnique({ where: { id: vendorId }, select: { id: true, userId: true } });
    if (!vendor) throw new Error("Vendor application not found.");
    await db.$transaction([
      db.vendor.update({ where: { id: vendor.id }, data: { approved: true } }),
      db.user.update({ where: { id: vendor.userId }, data: { role: "VENDOR" } }),
    ]);
    revalidatePath("/admin");
    revalidatePath("/vendor");
  }

  return <main className="wrap" style={{ paddingTop: 40, paddingBottom: 40 }}>
    <h1 style={{ fontSize: "2.5rem", marginBottom: 20 }}>Vendor applications</h1>
    <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 10, marginBottom: 40 }}>
      {vendors.length === 0 ? <p>No vendor applications yet.</p> : vendors.map((v) => <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid #ddd" }}>
        <div><strong>{v.shopName}</strong><p>{v.user.phone || v.user.email || v.userId} · {v.area}</p><small>{v.approved ? "Approved" : "Pending approval"}</small></div>
        {!v.approved && <form action={approveVendor}><input type="hidden" name="vendorId" value={v.id} /><button className="btn">Approve vendor</button></form>}
      </div>)}
    </div>
    <h1 style={{ fontSize: "2.5rem", marginBottom: 20 }}>All Orders</h1>
    <div style={{ background: "#f9f9f9", padding: 20, borderRadius: 10 }}>
      {orders.length === 0 ? <p>No orders yet.</p> : orders.map((o) => <div key={o.id} style={{ borderBottom: "1px solid #ddd", padding: "15px 0" }}>
        <p><strong>Order ID:</strong> {o.id}</p><p><strong>Customer:</strong> {o.user.name || o.user.phone || o.user.email}</p>
        <p><strong>Total:</strong> ৳{o.total} | <strong>Status:</strong> {o.status} | <strong>Method:</strong> {o.method}</p>
        <p><strong>Items:</strong> {o.items.map((i) => `${i.qty}x ${i.product.title}`).join(", ")}</p>
      </div>)}
    </div>
  </main>;
}
