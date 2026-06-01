import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGIN_LOCKED"
  | "PDF_ACCESS"
  | "PDF_UPLOAD"
  | "PDF_DELETE"
  | "LESSON_CREATE"
  | "LESSON_UPDATE"
  | "LESSON_DELETE"
  | "ADMIN_ACTION";

export async function logAudit(params: {
  userId?: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        metadata: JSON.stringify(params.metadata ?? {}),
        ip: params.ip,
        userAgent: params.userAgent,
      },
    });
  } catch {
    console.error("[Audit] Failed to log");
  }
}
