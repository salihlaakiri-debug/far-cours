import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function hasOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return timeToMin(aStart) < timeToMin(bEnd) && timeToMin(aEnd) > timeToMin(bStart);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const weeklyScheduleId = searchParams.get("weeklyScheduleId");

  if (!weeklyScheduleId) {
    return NextResponse.json({ error: "weeklyScheduleId مطلوب" }, { status: 400 });
  }

  const sessions = await prisma.session.findMany({
    where: { weeklyScheduleId },
    orderBy: { date: "asc" },
  });

  const byDate: Record<string, typeof sessions> = {};
  for (const s of sessions) {
    const key = s.date.toISOString().split("T")[0];
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(s);
  }

  const conflicts: Array<{
    type: "INSTRUCTOR" | "ROOM";
    message: string;
    sessionIds: string[];
    severity: "ERROR" | "WARNING";
  }> = [];

  for (const [dateKey, dateSessions] of Object.entries(byDate)) {
    const instructorGroups: Record<string, typeof sessions> = {};
    for (const s of dateSessions) {
      if (s.instructorName) {
        if (!instructorGroups[s.instructorName]) instructorGroups[s.instructorName] = [];
        instructorGroups[s.instructorName].push(s);
      }
    }
    for (const [instructor, sList] of Object.entries(instructorGroups)) {
      for (let i = 0; i < sList.length; i++) {
        for (let j = i + 1; j < sList.length; j++) {
          if (hasOverlap(sList[i].startTime, sList[i].endTime, sList[j].startTime, sList[j].endTime)) {
            conflicts.push({
              type: "INSTRUCTOR",
              message: `الأستاذ ${instructor} لديه حصتان متداخلتان في ${dateKey}`,
              sessionIds: [sList[i].id, sList[j].id],
              severity: "ERROR",
            });
          }
        }
      }
    }

    const roomGroups: Record<string, typeof sessions> = {};
    for (const s of dateSessions) {
      if (s.room) {
        if (!roomGroups[s.room]) roomGroups[s.room] = [];
        roomGroups[s.room].push(s);
      }
    }
    for (const [room, sList] of Object.entries(roomGroups)) {
      for (let i = 0; i < sList.length; i++) {
        for (let j = i + 1; j < sList.length; j++) {
          if (hasOverlap(sList[i].startTime, sList[i].endTime, sList[j].startTime, sList[j].endTime)) {
            conflicts.push({
              type: "ROOM",
              message: `القاعة ${room} محجوزة لحصتين متداخلتين في ${dateKey}`,
              sessionIds: [sList[i].id, sList[j].id],
              severity: "ERROR",
            });
          }
        }
      }
    }
  }

  return NextResponse.json({ conflicts });
}
