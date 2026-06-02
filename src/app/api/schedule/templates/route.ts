import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";

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

  logAudit({
    userId: user.id,
    action: "TEMPLATE_CREATE",
    metadata: { templateId: template.id, name, branchId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId,
    type: "TEMPLATE_CREATED",
    title: "قالب جديد",
    message: `تم إنشاء القالب "${name}"`,
    link: "/admin/templates",
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

  const deleted = await prisma.scheduleTemplate.delete({ where: { id } });

  logAudit({
    userId: user.id,
    action: "TEMPLATE_DELETE",
    metadata: { templateId: id, name: deleted.name },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    branchId: deleted.branchId,
    type: "TEMPLATE_DELETED",
    title: "حذف قالب",
    message: `تم حذف القالب "${deleted.name}"`,
    link: "/admin/templates",
  });

  return NextResponse.json({ success: true });
}
