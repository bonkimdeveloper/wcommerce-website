import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();
async function main() {
  const cats = ["Home kitchens", "Bakeries", "Farm stalls", "Street food"];
  const cs = [];
  for (const n of cats) cs.push(await db.category.upsert({ where: { slug: n.toLowerCase().replace(/\s/g, "-") }, update: {}, create: { name: n, slug: n.toLowerCase().replace(/\s/g, "-") } }));
  const u = await db.user.upsert({ where: { email: "demo-vendor@khabo.test" }, update: {}, create: { email: "demo-vendor@khabo.test", name: "Demo Vendor", role: "VENDOR" } });
  const v = await db.vendor.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id, shopName: "Rahima's Kitchen", area: "Dhanmondi", approved: true } });
  if ((await db.product.count()) === 0)
    await db.product.createMany({ data: [
      { vendorId: v.id, categoryId: cs[0].id, title: "Kacchi biryani", price: 320, description: "Mutton, aromatic rice" },
      { vendorId: v.id, categoryId: cs[0].id, title: "Beef bhuna + paratha", price: 220 },
      { vendorId: v.id, categoryId: cs[1].id, title: "Chocolate brownie box", price: 450 },
    ] });
}
main().then(() => db.$disconnect());
