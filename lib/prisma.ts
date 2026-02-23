import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// prisma.config.ts causes Prisma CLI to skip env loading — pass URL explicitly at runtime
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
    datasourceUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
