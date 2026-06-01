import type { StorageAdapter } from "./types";

export type { StorageAdapter };

const globalForStorage = globalThis as unknown as { storage: StorageAdapter | undefined };

export const localStorage: StorageAdapter = {
  async upload(key, body) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), "public", "uploads", key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, body);
  },

  async getUrl(key) {
    return `/uploads/${key}`;
  },

  async delete(key) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), "public", "uploads", key);
    await fs.unlink(fullPath).catch(() => {});
  },

  async exists(key) {
    const fs = await import("fs/promises");
    const path = await import("path");
    const fullPath = path.join(process.cwd(), "public", "uploads", key);
    return fs.access(fullPath).then(() => true).catch(() => false);
  },
};

export function getStorage(): StorageAdapter {
  if (globalForStorage.storage) return globalForStorage.storage;
  if (process.env.VERCEL) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { vercelBlobStorage } = require("./vercel-blob");
    return vercelBlobStorage;
  }
  return localStorage;
}