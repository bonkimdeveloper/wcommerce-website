import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding...");

  // 1. Settings
  const settings = [
    { key: "commission_rate", value: "5" },
    { key: "delivery_fee", value: "60" },
    { key: "bkash_number", value: "01323374428" },
    { key: "nagad_number", value: "01323374428" },
    { key: "site_name", value: "Khabo" },
  ];
  for (const s of settings) {
    await db.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Settings");

  // 2. Admin (UPDATED & SAFE)
  const adminPhone = "01333333333";
  const adminPassRaw = "admin321";
  const adminPass = await bcrypt.hash(adminPassRaw, 10);
  
  // পুরনো যেকোনো অ্যাডমিন থাকলে ডিলিট করে দেবো (যাতে কনফ্লিক্ট না হয়)
  await db.user.deleteMany({
    where: { 
      OR: [
        { role: "ADMIN" },
        { email: "admin@khabo.com" }
      ]
    } 
  });

  // নতুন অ্যাডমিন তৈরি
  await db.user.create({
    data: {
      phone: adminPhone,
      email: "admin@khabo.com", 
      password: adminPass,
      name: "Khabo Admin",
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin created! (phone: ${adminPhone}, pass: ${adminPassRaw})`);

  // 3. Categories
  const categories = [
    { name: "Rice & curry", slug: "rice-curry" },
    { name: "Chaat & fried", slug: "chaat-fried" },
    { name: "Sweets", slug: "sweets" },
    { name: "Farm fresh", slug: "farm-fresh" },
    { name: "Drinks", slug: "drinks" },
    { name: "Bakery", slug: "bakery" },
  ];
  const catMap: any = {};
  for (const c of categories) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = cat.id;
  }
  console.log("✅ Categories");

  // 4. Vendors + Products
  const vendorPass = await bcrypt.hash("Vendor@123", 10);
  const demos = [
    { phone: "01700000001", shop: "Bhai Bhai Biryani", area: "Dhanmondi", cat: "rice-curry", title: "chicken biryani", price: 220 },
    { phone: "01700000002", shop: "Ammu's Kitchen", area: "Mirpur", cat: "chaat-fried", title: "street snacks", price: 60 },
    { phone: "01700000003", shop: "Mishti Ghor", area: "Uttara", cat: "sweets", title: "mishti & sweets", price: 90 },
    { phone: "01700000004", shop: "Green Basket", area: "Banani", cat: "farm-fresh", title: "fresh & organic", price: 45 },
    { phone: "01700000005", shop: "Cha Adda", area: "Gulshan", cat: "drinks", title: "juice & drinks", price: 60 },
    { phone: "01700000006", shop: "Crust & Co", area: "Mohammadpur", cat: "bakery", title: "fresh bakery", price: 85 },
  ];

  for (const d of demos) {
    const user = await db.user.upsert({
      where: { phone: d.phone },
      update: {},
      create: {
        phone: d.phone,
        password: vendorPass,
        name: d.shop,
        role: "VENDOR",
      },
    });

    const vendor = await db.vendor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        shopName: d.shop,
        area: d.area,
        approved: true,
        commission: 5,
      },
    });

    const existing = await db.product.findFirst({
      where: { title: d.title, vendorId: vendor.id },
    });
    if (!existing) {
      await db.product.create({
        data: {
          vendorId: vendor.id,
          categoryId: catMap[d.cat],
          title: d.title,
          description: `${d.title} from ${d.shop}`,
          price: d.price,
          stock: 100,
          active: true,
        },
      });
    }

    await db.vendorBalance.upsert({
      where: { vendorId: vendor.id },
      update: {},
      create: {
        vendorId: vendor.id,
        available: 0,
        pending: 0,
        totalEarned: 0,
      },
    });
  }
  console.log("✅ 6 vendors + 6 products");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());