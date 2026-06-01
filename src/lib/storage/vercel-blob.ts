import type { StorageAdapter } from "./index";
import { put, del, head } from "@vercel/blob";

export const vercelBlobStorage: StorageAdapter = {
  async upload(key, body, contentType) {
    await put(key, body, { contentType, access: "public" });
  },

  async getUrl(key) {
    const blob = await head(key);
    return blob.url;
  },

  async delete(key) {
    await del(key);
  },

  async exists(key) {
    try {
      await head(key);
      return true;
    } catch {
      return false;
    }
  },
};