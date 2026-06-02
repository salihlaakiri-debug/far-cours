import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);
  const offset = Number(searchParams.get("offset")) || 0;
  const unreadOnly = searchParams.get("unread") === "true";

  const where = {
    userId: session.user.id,
    ...(unreadOnly ? { read: false } : {}),
  };

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    }),
    prisma.notification.count({ where: { userId: session.user.id } }),
    prisma.notification.count({ where: { userId: session.user.id, read: false } }),
  ]);

  return NextResponse.json({ notifications, total, unreadCount });
}
