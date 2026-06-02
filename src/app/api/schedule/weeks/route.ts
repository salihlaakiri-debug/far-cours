import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const branchId = req.nextUrl.searchParams.get("branchId");
  const status = req.nextUrl.searchParams.get("status");

  const where: Prisma.WeeklyScheduleWhereInput = {};
  if (branchId) where.branchId = branchId;
  if (status) where.status = status;
  else if (user.role === "USER") where.status = "PUBLISHED";

  const includeSessions = req.nextUrl.searchParams.get("includeSessions") === "true";

  const weeks = await prisma.weeklySchedule.findMany({
    where,
    include: {
      _count: { select: { sessions: true } },
      branch: { select: { name: true, slug: true } },
      ...(includeSessions && {
        sessions: {
          include: { lesson: { select: { id: true, title: true } } },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      }),
    },
    orderBy: { weekStart: "desc" },
  });
  return NextResponse.json(weeks);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { branchId, templateId, weekStart } = await req.json();
  const week = await prisma.weeklySchedule.create({
    data: { branchId, weekStart: new Date(weekStart), templateId: templateId || null, createdBy: user.id },
  });

  if (templateId) {
    const tplSessions = await prisma.templateSession.findMany({
      where: { templateId },
    });
    const start = new Date(weekStart);
    for (const ts of tplSessions) {
      const d = new Date(start);
      d.setDate(d.getDate() + (ts.dayOfWeek - 1));
      await prisma.session.create({
        data: {
          weeklyScheduleId: week.id,
          lessonId: ts.lessonId,
          instructorName: ts.instructorName,
          room: ts.room,
          date: d,
          startTime: ts.startTime,
          endTime: ts.endTime,
          title: ts.title,
          subtitle: ts.subtitle,
          sessionNum: ts.sessionNum,
          sessionType: ts.sessionType,
          isContinuation: ts.isContinuation,
        },
      });
    }
  }

  const weekLabel = weekStart ? new Date(weekStart).toLocaleDateString("ar-SA") : "";

  logAudit({
    userId: user.id,
    action: "WEEK_CREATE",
    metadata: { weekId: week.id, branchId, templateId, weekStart },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId,
    type: "WEEK_CREATED",
    title: "أسبوع دراسي جديد",
    message: `تم إنشاء أسبوع دراسي جديد يبدأ من ${weekLabel}`,
    link: "/schedule",
  });

  return NextResponse.json(week, { status: 201 });
}
