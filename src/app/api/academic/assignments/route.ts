import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
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

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.instructorAssignment.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
