import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuth } from "@/lib/api-auth";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const specialtyId = req.nextUrl.searchParams.get("specialtyId");
  const branchId = req.nextUrl.searchParams.get("branchId");

  const where: Prisma.LessonWhereInput = {};
  if (specialtyId) where.branch = { specialtyId };
  if (branchId) where.branchId = branchId;

  const lessons = await prisma.lesson.findMany({
    where,
    orderBy: { order: "asc" },
    include: {
      progress: {
        where: { userId: user.id },
        select: { lastPage: true, totalPages: true, completedAt: true },
      },
    },
  });

  const mapped = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    description: l.description,
    fileUrl: "",
    branchId: l.branchId,
    order: l.order,
    userProgress: l.progress[0]
      ? {
          lastPage: l.progress[0].lastPage,
          totalPages: l.progress[0].totalPages,
          completed: !!l.progress[0].completedAt,
        }
      : null,
  }));

  return NextResponse.json(mapped);
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const lesson = await prisma.lesson.findUnique({ where: { id } });
  if (!lesson) {
    return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
  }

  await prisma.lesson.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
