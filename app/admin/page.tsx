import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { revalidatePath } from "next/cache";
export const dynamic = "force-dynamic";
export default async function Admin() {
  await requireRole("ADMIN");
  const [vendors, orders] = await Promise.all([
    db.vendor.findMany({ include: { user: true }, orderBy: { approved: "asc" } }),
    db.order.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);
  async function save(fd: FormData) {
    "use server";
    await requireRole("ADMIN");
    await db.vendor.update({ where: { id: String(fd.get("id")) }, data: { approved: fd.get("approved") === "1", commission: Math.min(100, Math.max(0, +fd.get("commission")!)) } });
    revalidatePath("/admin");
  }
  return (
    <main className="wrap" style={{ paddingTop: 32 }}>
      <h2>Vendors</h2>
      <table><tbody>{vendors.map((v) => <tr key={v.id}><td>{v.shopName}<br /><small>{v.user.email}</small></td>
        <td colSpan={2}><form action={save} style={{ display: "flex", gap: 6 }}><input type="hidden" name="id" value={v.id} />
          <select name="approved" defaultValue={v.approved ? "1" : "0"}><option value="1">Approved</option><option value="0">Pending</option></select>
          <input name="commission" type="number" defaultValue={v.commission} style={{ width: 80 }} /><button className="btn ghost">Save</button></form></td></tr>)}</tbody></table>
      <h2 style={{ marginTop: 32 }}>All orders</h2>
      <table><tbody>{orders.map((o) => <tr key={o.id}><td>{o.user.email}</td><td>৳{o.total}</td><td>{o.method}</td><td>{o.status}</td></tr>)}</tbody></table>
    </main>
  );
}
