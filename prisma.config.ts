// prisma.config.ts
import { defineConfig } from "prisma/config";

/**
 * NOTE (Non-breaking / Build-fix):
 * The installed Prisma version's PrismaConfig type does NOT accept `datasource`.
 * We keep this file minimal and rely on `schema.prisma` for datasource URL
 * (e.g. url = env("DATABASE_URL")) to avoid breaking changes.
 */
export default defineConfig({
  migrations: {
    path: "prisma/migrations",
  },
});