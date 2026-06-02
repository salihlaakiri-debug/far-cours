import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuth } from "@/lib/api-auth";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const specialties = await prisma.specialty.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { branches: true } } },
  });
  return NextResponse.json(specialties);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { name, slug, order } = await req.json();
    const specialty = await prisma.specialty.create({
      data: { name, slug, order: order ?? 0 },
    });

    logAudit({
      userId: user.id,
      action: "SPECIALTY_CREATE",
      metadata: { specialtyId: specialty.id, name },
      ip: req.headers.get("x-forwarded-for") || undefined,
      userAgent: req.headers.get("user-agent") || undefined,
    });

    notifyUsers({
      role: "ADMIN",
      type: "SPECIALTY_CREATED",
      title: "تخصص جديد",
      message: `تم إنشاء التخصص "${name}"`,
      link: "/admin/specialties",
    });

    return NextResponse.json(specialty, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "المعرف موجود مسبقاً" }, { status: 409 });
    }
    return NextResponse.json({ error: "فشل إنشاء التخصص" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const deleted = await prisma.specialty.delete({ where: { id } });

  logAudit({
    userId: user.id,
    action: "SPECIALTY_DELETE",
    metadata: { specialtyId: id, name: deleted.name },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    role: "ADMIN",
    type: "SPECIALTY_DELETED",
    title: "حذف تخصص",
    message: `تم حذف التخصص "${deleted.name}"`,
    link: "/admin/specialties",
  });

  return NextResponse.json({ ok: true });
}
