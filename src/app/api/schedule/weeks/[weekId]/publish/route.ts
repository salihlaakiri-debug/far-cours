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
  const { prisma } = await import("@/lib/prisma");

  const week = await prisma.weeklySchedule.update({
    where: { id: weekId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });

  return NextResponse.json(week);
}
