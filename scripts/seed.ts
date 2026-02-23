import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // یک کاربر تستی ثابت
  const email = "test@takhmino.local";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password: "test1234", // فعلاً خام و تستی (بعداً هش می‌کنیم)
      name: "کاربر تست",
      profile: {
        create: {
          financialScore: 60,
          financialType: "متعادل",
          totalToolRuns: 0,
        },
      },
    },
    include: { profile: true },
  });

  console.log("SEED OK ✅");
  console.log("USER ID:", user.id);
  console.log("EMAIL:", user.email);
}

main()
  .catch((e) => {
    console.error("SEED ERROR ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
