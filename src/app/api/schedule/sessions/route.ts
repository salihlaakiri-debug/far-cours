import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

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

  const session = await prisma.session.update({
    where: { id },
    data: body,
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

  await prisma.session.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
