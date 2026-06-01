import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const userId = req.nextUrl.searchParams.get("userId");
  const completed = req.nextUrl.searchParams.get("completed");

  const where: Prisma.UserProgressWhereInput = {};
  if (userId) where.userId = userId;
  if (completed === "true") where.completedAt = { not: null };
  else if (completed === "false") where.completedAt = null;

  const progress = await prisma.userProgress.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, rank: true, militaryId: true } },
      lesson: { select: { id: true, title: true, pageCount: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(progress);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lessonId, lastPage, totalPages, completed } = body;

    if (!lessonId || typeof lastPage !== "number") {
      return NextResponse.json({ error: "بيانات غير صالحة" }, { status: 400 });
    }

    const data: Prisma.UserProgressUpdateInput = { lastPage };
    if (typeof totalPages === "number") data.totalPages = totalPages;
    if (completed) data.completedAt = new Date();
    else data.completedAt = null;

    await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      update: data,
      create: {
        userId: user.id,
        lessonId,
        lastPage,
        totalPages: typeof totalPages === "number" ? totalPages : 0,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "خطأ في حفظ التقدم" }, { status: 500 });
  }
}
