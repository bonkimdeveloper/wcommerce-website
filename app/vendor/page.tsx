import { db } from "@/lib/db";
import { getSession, requireApprovedVendor } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function VendorDash() {
  const session = await getSession();
  const sessionUser = session?.user as any;
  if (!sessionUser?.id) redirect("/");
  if (sessionUser.role !== "VENDOR") {
    const application = await db.vendor.findUnique({ where: { userId: sessionUser.id } });
    if (application && !application.approved) return <main className="wrap" style={{ paddingTop: 32 }}><h2>{application.shopName}</h2><p className="pill">Waiting for admin approval</p><p>Your account remains a customer until an administrator approves your shop.</p></main>;
    redirect("/vendor/apply");
  }
  const { vendor } = await requireApprovedVendor();
  const [cats, products, items] = await Promise.all([
    db.category.findMany(),
    db.product.findMany({ where: { vendorId: vendor.id } }),
    db.orderItem.findMany({ where: { vendorId: vendor.id, order: { status: { not: "CANCELLED" } } }, include: { product: true, order: true }, orderBy: { order: { createdAt: "desc" } }, take: 30 }),
  ]);
  const earned = items.filter((i) => i.order.status !== "PENDING" || i.order.method === "COD").reduce((a, i) => a + i.price * i.qty, 0) * (1 - vendor.commission / 100);
  async function addProduct(fd: FormData) {
    "use server";
    const { vendor: v } = await requireApprovedVendor();
    const title = String(fd.get("title") || "").trim(), description = String(fd.get("desc") || "").trim(), categoryId = String(fd.get("cat") || ""), price = Number(fd.get("price"));
    if (title.length < 2 || title.length > 120 || description.length > 2000 || !Number.isSafeInteger(price) || price < 1 || price > 10000000) throw new Error("Invalid product details.");
    if (!(await db.category.findUnique({ where: { id: categoryId } }))) throw new Error("Invalid category.");
    await db.product.create({ data: { vendorId: v.id, categoryId, title, description, price } });
    revalidatePath("/vendor");
  }
  async function toggle(fd: FormData) {
    "use server";
    const { vendor: v } = await requireApprovedVendor();
    const id = String(fd.get("id") || "");
    const product = await db.product.findFirst({ where: { id, vendorId: v.id } });
    if (product) await db.product.update({ where: { id: product.id }, data: { active: !product.active } });
    revalidatePath("/vendor");
  }
  async function setStatus(fd: FormData) {
    "use server";
    const { vendor: v } = await requireApprovedVendor();
    const orderId = String(fd.get("id") || ""), status = String(fd.get("status") || "");
    if (!["PROCESSING", "SHIPPED", "DELIVERED"].includes(status)) throw new Error("Invalid order status.");
    const item = await db.orderItem.findFirst({ where: { orderId, vendorId: v.id } });
    if (item) await db.order.update({ where: { id: item.orderId }, data: { status: status as any } });
    revalidatePath("/vendor");
  }
  return <main className="wrap" style={{ paddingTop: 32 }}><h2>{vendor.shopName}</h2><p>Earnings so far (after {vendor.commission}% commission): <strong>৳{Math.round(earned)}</strong></p>
    <h3>Add a dish</h3><form action={addProduct} style={{ display: "grid", gap: 8, maxWidth: 420 }}><input name="title" placeholder="Name" required maxLength={120} /><input name="desc" placeholder="Short description" maxLength={2000} /><input name="price" type="number" min="1" max="10000000" step="1" placeholder="Price (৳)" required /><select name="cat" required>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><button className="btn">Add dish</button></form>
    <h3 style={{ marginTop: 28 }}>Menu</h3><table><tbody>{products.map((p) => <tr key={p.id}><td>{p.title}</td><td>৳{p.price}</td><td><form action={toggle}><input type="hidden" name="id" value={p.id} /><button className="btn ghost">{p.active ? "Hide" : "Show"}</button></form></td></tr>)}</tbody></table>
    <h3 style={{ marginTop: 28 }}>Recent orders</h3><table><tbody>{items.map((i) => <tr key={i.id}><td>{i.qty} × {i.product.title}</td><td>{i.order.status}</td><td><form action={setStatus} style={{ display: "flex", gap: 6 }}><input type="hidden" name="id" value={i.orderId} /><select name="status" defaultValue={i.order.status}>{["PROCESSING", "SHIPPED", "DELIVERED"].map((s) => <option key={s}>{s}</option>)}</select><button className="btn ghost">Save</button></form></td></tr>)}</tbody></table>
  </main>;
}
