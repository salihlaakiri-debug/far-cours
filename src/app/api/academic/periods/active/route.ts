import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const period = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    include: {
      lessonSchedules: { include: { lesson: { include: { branch: true } } } },
      _count: { select: { enrollments: true, instructorAssignments: true } },
    },
  });
  return NextResponse.json(period);
}
