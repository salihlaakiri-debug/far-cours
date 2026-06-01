export interface StorageAdapter {
  upload(key: string, body: Buffer, contentType: string, size: number): Promise<void>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}