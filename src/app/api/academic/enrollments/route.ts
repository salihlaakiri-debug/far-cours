import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
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
  const enrollment = await prisma.enrollment.upsert({
    where: { userId_academicPeriodId: { userId, academicPeriodId } },
    update: { instructorId: instructorId || undefined },
    create: { userId, instructorId, academicPeriodId },
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

  await prisma.enrollment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
