import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { normalizeBdPhone } from '../lib/security'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding started...')

  const adminPhone = normalizeBdPhone(process.env.ADMIN_PHONE)
  const adminPassword = process.env.ADMIN_PASSWORD
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase() || null

  if (!adminPhone || !adminPassword || adminPassword.length < 12 || adminPassword.length > 72) {
    throw new Error('Set a valid ADMIN_PHONE and an ADMIN_PASSWORD between 12 and 72 characters before seeding.')
  }

  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)
  await prisma.user.upsert({
    where: { phone: adminPhone },
    update: { role: 'ADMIN', ...(adminEmail ? { email: adminEmail } : {}) },
    create: {
      phone: adminPhone,
      password: adminPasswordHash,
      email: adminEmail,
      name: 'Khabo Admin',
      role: 'ADMIN',
    },
  })

  // Demo shop remains a pending customer application; it is never pre-approved.
  const vendorUser = await prisma.user.upsert({
    where: { email: 'vendor@gmail.com' },
    update: { role: 'CUSTOMER' },
    create: { email: 'vendor@gmail.com', name: 'Bhai Bhai Biryani', role: 'CUSTOMER' },
  })

  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: { approved: false },
    create: { userId: vendorUser.id, shopName: 'Bhai Bhai Biryani', area: 'Dhanmondi', approved: false },
  })

  const category = await prisma.category.upsert({
    where: { slug: 'rice-curry' },
    update: {},
    create: { name: 'Rice & Curry', slug: 'rice-curry' },
  })

  let product = await prisma.product.findFirst()
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

  console.log('Data seeded successfully!')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
