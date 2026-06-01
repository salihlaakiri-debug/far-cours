import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  if (process.env.TURSO_DATABASE_URL) {
    // Use @libsql/client/http to avoid loading the native libsql module
    // The full @libsql/client loads sqlite3 native module which fails on Vercel
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { createClient } = require("@libsql/client/http");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaLibSQL } = require("@prisma/adapter-libsql");
      const libsql = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) });
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