import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding started...')

  // ১. অ্যাডমিন ইউজার তৈরি
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: { role: 'ADMIN' },
    create: { email: 'admin@gmail.com', name: 'Admin Bhai', role: 'ADMIN' },
  })

  // ২. ভেন্ডর ইউজার তৈরি
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@gmail.com' },
    update: { role: 'VENDOR' },
    create: { email: 'vendor@gmail.com', name: 'Bhai Bhai Biryani', role: 'VENDOR' },
  })

  // ৩. ভেন্ডর প্রোফাইল তৈরি
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: {},
    create: { userId: vendorUser.id, shopName: 'Bhai Bhai Biryani', area: 'Dhanmondi', approved: true },
  })

  // ৪. ক্যাটাগরি তৈরি
  const category = await prisma.category.upsert({
    where: { slug: 'rice-curry' },
    update: {},
    create: { name: 'Rice & Curry', slug: 'rice-curry' },
  })

  // ৫. প্রোডাক্ট তৈরি
  let product = await prisma.product.findFirst();
  if (!product) {
    product = await prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: category.id,
        title: 'Chicken Biryani',
        description: 'Slow-cooked rice and spice',
        price: 220,
        stock: 50,
      },
    })
  }

  // ৬. কাস্টমার তৈরি
  const customer = await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: {},
    create: { email: 'customer@gmail.com', name: 'Rakib Hasan', role: 'CUSTOMER' },
  })

  // ৭. ডেমো অর্ডার তৈরি (যদি আগে না থাকে)
  const orderCheck = await prisma.order.findFirst();
  if (!orderCheck && product) {
    await prisma.order.create({
      data: {
        userId: customer.id,
        total: product.price,
        status: 'PAID',
        method: 'BKASH',
        address: { line: 'House 123, Dhanmondi', phone: '01700000000' },
        items: {
          create: [{ productId: product.id, vendorId: vendor.id, qty: 1, price: product.price }]
        }
      }
    });
  }

  console.log('Data seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })