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

  const where: Prisma.InstructorAssignmentWhereInput = {};
  if (user.role === "INSTRUCTOR") where.instructorId = user.id;
  if (periodId) where.academicPeriodId = periodId;

  const assignments = await prisma.instructorAssignment.findMany({
    where,
    include: {
      branch: true,
      instructor: { select: { id: true, name: true, rank: true, militaryId: true } },
      academicPeriod: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { instructorId, branchId, academicPeriodId } = await req.json();
  if (!instructorId || !branchId || !academicPeriodId) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const assignment = await prisma.instructorAssignment.create({
    data: { instructorId, branchId, academicPeriodId },
  });

  logAudit({
    userId: user.id,
    action: "ASSIGNMENT_CREATE",
    metadata: { assignmentId: assignment.id, instructorId, branchId, academicPeriodId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  const instructor = await prisma.user.findUnique({ where: { id: instructorId }, select: { name: true, rank: true } });

  notifyUsers({
    userIds: [instructorId],
    type: "ASSIGNMENT_CREATED",
    title: "تكليف جديد",
    message: `تم تكليف ${instructor?.rank} ${instructor?.name}`,
    link: "/",
  });

  return NextResponse.json(assignment, { status: 201 });
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

  const deleted = await prisma.instructorAssignment.delete({ where: { id } });

  logAudit({
    userId: user.id,
    action: "ASSIGNMENT_DELETE",
    metadata: { assignmentId: id, instructorId: deleted.instructorId, branchId: deleted.branchId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    userIds: [deleted.instructorId],
    type: "ASSIGNMENT_DELETED",
    title: "إلغاء تكليف",
    message: "تم إلغاء تكليفك كمدرب",
    link: "/admin/assignments",
  });

  return NextResponse.json({ success: true });
}
