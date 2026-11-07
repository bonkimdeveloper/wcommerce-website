
require("@next/env").loadEnvConfig(process.cwd());

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const phone = process.env.ADMIN_PHONE?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !/^01[3-9]\d{8}$/.test(phone || "")) {
    throw new Error("Invalid email or Bangladesh phone number.");
  }

  if (!password || password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }

  const admin = await db.user.findUnique({
    where: { email },
  });

  if (!admin || admin.role !== "ADMIN") {
    throw new Error("Existing ADMIN account not found.");
  }

  const existingPhone = await db.user.findUnique({
    where: { phone },
  });

  if (existingPhone && existingPhone.id !== admin.id) {
    throw new Error("Phone number already belongs to another user.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.user.update({
    where: { id: admin.id },
    data: {
      phone,
      password: hashedPassword,
    },
  });

  console.log("SUCCESS: Admin phone and password updated.");
  console.log("Admin role:", admin.role);
}

main()
  .catch((error) => {
    console.error("ERROR:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
