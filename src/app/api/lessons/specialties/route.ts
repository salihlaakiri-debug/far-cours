import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuth } from "@/lib/api-auth";

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

  await prisma.specialty.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
