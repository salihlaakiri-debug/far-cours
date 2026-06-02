import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const periodId = req.nextUrl.searchParams.get("periodId");

  const where: Prisma.EnrollmentWhereInput = {};
  if (user.role === "INSTRUCTOR") where.instructorId = user.id;
  if (user.role === "USER") where.userId = user.id;
  if (periodId) where.academicPeriodId = periodId;

  const enrollments = await prisma.enrollment.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, rank: true, militaryId: true } },
      instructor: { select: { id: true, name: true, rank: true } },
      academicPeriod: true,
    },
    orderBy: { enrolledAt: "desc" },
  });
  return NextResponse.json(enrollments);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || (user.role !== "ADMIN" && user.role !== "INSTRUCTOR")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { userId, instructorId, academicPeriodId } = await req.json();

  const [enrolledUser, period] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, rank: true } }),
    prisma.academicPeriod.findUnique({ where: { id: academicPeriodId }, select: { name: true } }),
  ]);

  const enrollment = await prisma.enrollment.upsert({
    where: { userId_academicPeriodId: { userId, academicPeriodId } },
    update: { instructorId: instructorId || undefined },
    create: { userId, instructorId, academicPeriodId },
  });

  const targetIds: string[] = [userId];
  if (instructorId) targetIds.push(instructorId);

  logAudit({
    userId: user.id,
    action: "ENROLLMENT_CREATE",
    metadata: { enrollmentId: enrollment.id, userId, instructorId, academicPeriodId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    userIds: targetIds,
    type: "ENROLLMENT_CREATED",
    title: "تسجيل جديد",
    message: `تم تسجيل ${enrolledUser?.rank} ${enrolledUser?.name} في ${period?.name || academicPeriodId}`,
    link: "/",
  });

  return NextResponse.json(enrollment);
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const deleted = await prisma.enrollment.delete({ where: { id } });

  logAudit({
    userId: user.id,
    action: "ENROLLMENT_DELETE",
    metadata: { enrollmentId: id, userId: deleted.userId, academicPeriodId: deleted.academicPeriodId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    userIds: [deleted.userId].concat(deleted.instructorId ? [deleted.instructorId] : []),
    type: "ENROLLMENT_DELETED",
    title: "إلغاء تسجيل",
    message: "تم إلغاء تسجيلك من الفترة الأكاديمية",
    link: "/admin/enrollments",
  });

  return NextResponse.json({ success: true });
}
