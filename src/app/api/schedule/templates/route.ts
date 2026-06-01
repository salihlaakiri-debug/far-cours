import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (id) {
    const template = await prisma.scheduleTemplate.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true } },
        sessions: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      },
    });
    if (!template) {
      return NextResponse.json({ error: "القالب غير موجود" }, { status: 404 });
    }
    return NextResponse.json(template);
  }

  const templates = await prisma.scheduleTemplate.findMany({
    include: { _count: { select: { sessions: true } }, branch: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role === "USER") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { branchId, name, description } = await req.json();
  const template = await prisma.scheduleTemplate.create({
    data: { branchId, name, description },
  });
  return NextResponse.json(template, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  }

  await prisma.scheduleTemplate.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
