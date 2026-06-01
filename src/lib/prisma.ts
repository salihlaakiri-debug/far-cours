import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  let adapter: unknown;

  if (process.env.TURSO_DATABASE_URL) {
    try {
      const { createClient } = require("@libsql/client");
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      adapter = new PrismaLibSQL(libsql);
    } catch (e) {
      console.warn("Turso unavailable, using SQLite:", (e as Error).message);
    }
  }

  if (!adapter) {
    const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
    adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./prisma/dev.db" });
  }

  globalForPrisma.prisma = new PrismaClient({ adapter, log: ["error", "warn"] });
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient];
  },
});