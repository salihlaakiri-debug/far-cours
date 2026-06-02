import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { weeklyScheduleId, lessonId, instructorName, room, date, startTime, endTime, title, subtitle, sessionType } = await req.json();

  const session = await prisma.session.create({
    data: {
      weeklyScheduleId,
      lessonId,
      instructorName,
      room,
      date: new Date(date),
      startTime,
      endTime,
      title,
      subtitle,
      sessionType: sessionType || "COURS",
    },
  });

  const week = await prisma.weeklySchedule.findUnique({ where: { id: weeklyScheduleId }, select: { branchId: true } });

  logAudit({
    userId: user.id,
    action: "SESSION_CREATE",
    metadata: { sessionId: session.id, weeklyScheduleId, title },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId: week?.branchId,
    type: "SESSION_CREATED",
    title: "حصة جديدة",
    message: `تمت إضافة حصة "${title || sessionType || 'COURS'}"`,
    link: "/schedule",
  });

  return NextResponse.json(session, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });

  const body = await req.json();
  if (body.date) body.date = new Date(body.date);

  const old = await prisma.session.findUnique({ where: { id }, select: { weeklyScheduleId: true, title: true, sessionType: true } });

  const session = await prisma.session.update({
    where: { id },
    data: body,
  });

  const week = old ? await prisma.weeklySchedule.findUnique({ where: { id: old.weeklyScheduleId }, select: { branchId: true } }) : null;

  logAudit({
    userId: user.id,
    action: "SESSION_UPDATE",
    metadata: { sessionId: id, changes: Object.keys(body) },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId: week?.branchId,
    type: "SESSION_UPDATED",
    title: "تحديث حصة",
    message: `تم تحديث الحصة "${old?.title || old?.sessionType || 'COURS'}"`,
    link: "/schedule",
  });

  return NextResponse.json(session);
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "معرف الحصة مطلوب" }, { status: 400 });

  const deleted = await prisma.session.delete({ where: { id } });
  const week = await prisma.weeklySchedule.findUnique({ where: { id: deleted.weeklyScheduleId }, select: { branchId: true } });

  logAudit({
    userId: user.id,
    action: "SESSION_DELETE",
    metadata: { sessionId: id, title: deleted.title, weeklyScheduleId: deleted.weeklyScheduleId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId: week?.branchId,
    type: "SESSION_DELETED",
    title: "حذف حصة",
    message: `تم حذف الحصة "${deleted.title || deleted.sessionType || 'COURS'}"`,
    link: "/schedule",
  });

  return NextResponse.json({ success: true });
}
