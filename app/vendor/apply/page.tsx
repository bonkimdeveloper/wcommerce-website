import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { redirect } from "next/navigation";
export default function Apply() {
  async function apply(fd: FormData) {
    "use server";
    const u = await requireRole("CUSTOMER", "VENDOR", "ADMIN");
    await db.vendor.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id, shopName: String(fd.get("shop")), area: String(fd.get("area")) } });
    if (u.role === "CUSTOMER") await db.user.update({ where: { id: u.id }, data: { role: "VENDOR" } });
    redirect("/vendor");
  }
  return (
    <main className="wrap" style={{ maxWidth: 480, paddingTop: 40 }}>
      <h2>Open a shop</h2><p>An admin approves your shop before it goes live.</p>
      <form action={apply}><label>Shop name</label><input name="shop" required /><label>Area</label><input name="area" required />
        <p><button className="btn">Apply</button></p></form>
    </main>
  );
}
