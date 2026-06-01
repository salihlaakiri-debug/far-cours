import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ weekId: string }> }
) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { weekId } = await params;
  const { targetWeekStart } = await req.json();
  const { prisma } = await import("@/lib/prisma");

  const source = await prisma.weeklySchedule.findUnique({
    where: { id: weekId },
    include: { sessions: true },
  });
  if (!source) {
    return NextResponse.json({ error: "الأسبوع غير موجود" }, { status: 404 });
  }

  const start = new Date(targetWeekStart);
  const sourceStart = new Date(source.weekStart);
  const diff = start.getTime() - sourceStart.getTime();

  const week = await prisma.weeklySchedule.create({
    data: {
      branchId: source.branchId,
      templateId: source.templateId,
      weekStart: start,
      createdBy: user.id,
    },
  });

  for (const s of source.sessions) {
    const d = new Date(s.date);
    d.setTime(d.getTime() + diff);
    await prisma.session.create({
      data: {
        weeklyScheduleId: week.id,
        lessonId: s.lessonId,
        instructorName: s.instructorName,
        room: s.room,
        date: d,
        startTime: s.startTime,
        endTime: s.endTime,
        title: s.title,
        subtitle: s.subtitle,
        sessionNum: s.sessionNum,
        sessionType: s.sessionType,
        isContinuation: s.isContinuation,
      },
    });
  }

  return NextResponse.json(week, { status: 201 });
}
