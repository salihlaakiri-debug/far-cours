import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma(): PrismaClient {
  if (process.env.TURSO_DATABASE_URL) {
    try {
      const { createClient } = require("@libsql/client");
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      return new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
    } catch (e) {
      console.warn("Turso unavailable, using SQLite:", (e as Error).message);
    }
  }

  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  return new PrismaClient({ adapter, log: ["error", "warn"] });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}