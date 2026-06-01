import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  if (process.env.TURSO_DATABASE_URL) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSql } = require("@prisma/adapter-libsql/web");
      globalForPrisma.prisma = new PrismaClient({
        adapter: new PrismaLibSql({
          url: process.env.TURSO_DATABASE_URL,
          authToken: process.env.TURSO_AUTH_TOKEN,
        }),
      });
      return globalForPrisma.prisma;
    } catch (e) {
      console.warn("Turso unavailable:", (e as Error).message);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  globalForPrisma.prisma = new PrismaClient({ adapter, log: ["error", "warn"] });
  return globalForPrisma.prisma;
}

export const prisma = createPrisma();