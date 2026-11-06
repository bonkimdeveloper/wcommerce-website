import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Apply() {
  const session = await getSession();
  const user = session?.user as any;
  if (!user?.id) redirect("/");
  const existing = await db.vendor.findUnique({ where: { userId: user.id } });
  if (user.role === "VENDOR" && existing?.approved) redirect("/vendor");
  if (existing && !existing.approved) {
    return <main className="wrap" style={{ maxWidth: 560, paddingTop: 40 }}><h2>Application under review</h2><p>Your shop application has been submitted. Your account remains a customer until an admin approves it.</p><p><strong>Shop:</strong> {existing.shopName}</p></main>;
  }
  if (user.role !== "CUSTOMER") redirect("/");
  async function apply(fd: FormData) {
    "use server";
    const current = await getSession();
    const currentUser = current?.user as any;
    if (!currentUser?.id) throw new Error("Unauthorized");
    const shopName = String(fd.get("shop") || "").trim();
    const area = String(fd.get("area") || "").trim();
    if (shopName.length < 2 || shopName.length > 80 || area.length > 120) throw new Error("Please enter a valid shop name and area.");
    await db.vendor.upsert({
      where: { userId: currentUser.id },
      update: {},
      create: { userId: currentUser.id, shopName, area, approved: false },
    });
    redirect("/vendor");
  }
  return <main className="wrap" style={{ maxWidth: 480, paddingTop: 40 }}><h2>Open a shop</h2><p>Submit your shop for admin review. Your account will remain a customer until approval.</p><form action={apply}><label>Shop name</label><input name="shop" required maxLength={80} /><label>Area</label><input name="area" required maxLength={120} /><p><button className="btn">Submit application</button></p></form></main>;
}
