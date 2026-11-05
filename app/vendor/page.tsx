import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
export default async function VendorDash() {
  const u = await requireRole("VENDOR", "ADMIN");
  const vendor = await db.vendor.findUnique({ where: { userId: u.id } });
  if (!vendor) return <main className="wrap"><p>No shop yet. <a href="/vendor/apply">Open one</a>.</p></main>;
  const [cats, products, items] = await Promise.all([
    db.category.findMany(),
    db.product.findMany({ where: { vendorId: vendor.id } }),
    db.orderItem.findMany({ where: { vendorId: vendor.id, order: { status: { not: "CANCELLED" } } }, include: { product: true, order: true }, orderBy: { order: { createdAt: "desc" } }, take: 30 }),
  ]);
  const earned = items.filter((i) => i.order.status !== "PENDING" || i.order.method === "COD").reduce((a, i) => a + i.price * i.qty, 0) * (1 - vendor.commission / 100);

  async function addProduct(fd: FormData) {
    "use server";
    const u = await requireRole("VENDOR", "ADMIN");
    const v = await db.vendor.findUniqueOrThrow({ where: { userId: u.id } });
    await db.product.create({ data: { vendorId: v.id, categoryId: String(fd.get("cat")), title: String(fd.get("title")), description: String(fd.get("desc") || ""), price: Math.max(1, +fd.get("price")!) } });
    revalidatePath("/vendor");
  }
  async function toggle(fd: FormData) {
    "use server";
    const u = await requireRole("VENDOR", "ADMIN");
    const v = await db.vendor.findUniqueOrThrow({ where: { userId: u.id } });
    const p = await db.product.findFirst({ where: { id: String(fd.get("id")), vendorId: v.id } });
    if (p) await db.product.update({ where: { id: p.id }, data: { active: !p.active } });
    revalidatePath("/vendor");
  }
  async function setStatus(fd: FormData) {
    "use server";
    const u = await requireRole("VENDOR", "ADMIN");
    const v = await db.vendor.findUniqueOrThrow({ where: { userId: u.id } });
    const oi = await db.orderItem.findFirst({ where: { orderId: String(fd.get("id")), vendorId: v.id } });
    if (oi) await db.order.update({ where: { id: oi.orderId }, data: { status: String(fd.get("status")) as any } });
    revalidatePath("/vendor");
  }
  return (
    <main className="wrap" style={{ paddingTop: 32 }}>
      <h2>{vendor.shopName}</h2>
      {!vendor.approved && <p><span className="pill">Waiting for admin approval</span></p>}
      <p>Earnings so far (after {vendor.commission}% commission): <strong>৳{Math.round(earned)}</strong></p>
      <h3>Add a dish</h3>
      <form action={addProduct} style={{ display: "grid", gap: 8, maxWidth: 420 }}>
        <input name="title" placeholder="Name" required /><input name="desc" placeholder="Short description" />
        <input name="price" type="number" placeholder="Price (৳)" required />
        <select name="cat">{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn">Add dish</button></form>
      <h3 style={{ marginTop: 28 }}>Menu</h3>
      <table><tbody>{products.map((p) => <tr key={p.id}><td>{p.title}</td><td>৳{p.price}</td>
        <td><form action={toggle}><input type="hidden" name="id" value={p.id} /><button className="btn ghost">{p.active ? "Hide" : "Show"}</button></form></td></tr>)}</tbody></table>
      <h3 style={{ marginTop: 28 }}>Recent orders</h3>
      <table><tbody>{items.map((i) => <tr key={i.id}><td>{i.qty} × {i.product.title}</td><td>{i.order.status}</td>
        <td><form action={setStatus} style={{ display: "flex", gap: 6 }}><input type="hidden" name="id" value={i.orderId} />
          <select name="status" defaultValue={i.order.status}>{["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].map((s) => <option key={s}>{s}</option>)}</select><button className="btn ghost">Save</button></form></td></tr>)}</tbody></table>
    </main>
  );
}
