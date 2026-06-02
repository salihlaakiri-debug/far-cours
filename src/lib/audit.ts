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
  | "ADMIN_ACTION"
  // Extended audit actions
  | "USER_CREATE"
  | "USER_UPDATE"
  | "USER_DELETE"
  | "USER_TOGGLE_ACTIVE"
  | "BRANCH_CREATE"
  | "BRANCH_DELETE"
  | "SPECIALTY_CREATE"
  | "SPECIALTY_DELETE"
  | "ENROLLMENT_CREATE"
  | "ENROLLMENT_DELETE"
  | "ASSIGNMENT_CREATE"
  | "ASSIGNMENT_DELETE"
  | "PERIOD_CREATE"
  | "PERIOD_UPDATE"
  | "PERIOD_DELETE"
  | "WEEK_CREATE"
  | "WEEK_PUBLISH"
  | "SESSION_CREATE"
  | "SESSION_UPDATE"
  | "SESSION_DELETE"
  | "TEMPLATE_CREATE"
  | "TEMPLATE_DELETE";

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
