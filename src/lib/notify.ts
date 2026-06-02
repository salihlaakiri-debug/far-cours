import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "LESSON_UPLOADED"
  | "LESSON_DELETED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "ENROLLMENT_CREATED"
  | "ENROLLMENT_DELETED"
  | "SCHEDULE_PUBLISHED"
  | "WEEK_CREATED"
  | "SESSION_CREATED"
  | "SESSION_UPDATED"
  | "SESSION_DELETED"
  | "TEMPLATE_CREATED"
  | "TEMPLATE_DELETED"
  | "PERIOD_CREATED"
  | "PERIOD_UPDATED"
  | "BRANCH_CREATED"
  | "BRANCH_DELETED"
  | "SPECIALTY_CREATED"
  | "SPECIALTY_DELETED"
  | "PERIOD_DELETED"
  | "ASSIGNMENT_CREATED"
  | "ASSIGNMENT_DELETED";

interface NotifyParams {
  userIds?: string[];
  role?: string;
  branchId?: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

export async function notifyUsers(params: NotifyParams): Promise<void> {
  try {
    let userIds = params.userIds || [];

    if (params.role && userIds.length === 0) {
      const users = await prisma.user.findMany({
        where: { role: params.role, active: true },
        select: { id: true },
      });
      userIds = users.map((u) => u.id);
    }

    if (params.branchId && userIds.length === 0) {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          academicPeriod: { isActive: true },
        },
        include: { user: { select: { id: true } } },
      });
      const instructorAssignments = await prisma.instructorAssignment.findMany({
        where: { branchId: params.branchId },
        select: { instructorId: true },
      });
      const instructorIds = instructorAssignments.map((a) => a.instructorId);
      const studentIds = enrollments.map((e) => e.user.id);
      userIds = [...new Set([...instructorIds, ...studentIds])];
    }

    if (userIds.length === 0) return;

    await prisma.notification.createMany({
      data: userIds.map((userId) => ({
        userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
      })),
    });
  } catch {
    console.error("[Notify] Failed to create notifications");
  }
}
