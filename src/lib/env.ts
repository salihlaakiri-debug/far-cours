const requiredVars = [
  "DATABASE_URL",
  "REDIS_URL",
  "MINIO_ENDPOINT",
  "MINIO_ACCESS_KEY",
  "MINIO_SECRET_KEY",
  "MINIO_BUCKET",
  "AUTH_SECRET",
] as const;

export function validateEnv(): void {
  const missing: string[] = [];
  for (const key of requiredVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join("\n  ")}\n` +
        "Application startup aborted."
    );
  }
}

export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT!,
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY!,
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY!,
  MINIO_BUCKET: process.env.MINIO_BUCKET!,
  MINIO_REGION: process.env.MINIO_REGION || "us-east-1",
  MINIO_USE_SSL: process.env.MINIO_USE_SSL === "true",
  AUTH_SECRET: process.env.AUTH_SECRET!,
  AUTH_URL: process.env.AUTH_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
} as const;
