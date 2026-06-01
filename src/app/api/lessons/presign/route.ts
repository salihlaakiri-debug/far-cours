import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { getStorage } from "@/lib/storage";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const lessonId = req.nextUrl.searchParams.get("id");
  if (!lessonId) {
    return NextResponse.json({ error: "معرف الدرس مطلوب" }, { status: 400 });
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { branch: { include: { specialty: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "الدرس غير موجود" }, { status: 404 });
  }

  const cacheKey = `url:${lessonId}:${user.id}`;
  let fileUrl = await redis.get(cacheKey);

  if (!fileUrl) {
    fileUrl = await getStorage().getUrl(lesson.pdfKey);
    await redis.setex(cacheKey, 840, fileUrl);
  }

  await logAudit({
    userId: user.id,
    action: "PDF_ACCESS",
    metadata: { lessonId, pdfKey: lesson.pdfKey },
    ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  await prisma.userProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    update: { viewCount: { increment: 1 } },
    create: { userId: user.id, lessonId, viewCount: 1 },
  });

  const progress = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    select: { completedAt: true },
  });

  return NextResponse.json({
    url: fileUrl,
    title: lesson.title,
    pageCount: lesson.pageCount,
    specialty: lesson.branch.specialty.name,
    branch: lesson.branch.name,
    completed: !!progress?.completedAt,
  });
}
