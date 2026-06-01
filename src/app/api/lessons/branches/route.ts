import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiAuth } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const specialtyId = req.nextUrl.searchParams.get("specialtyId");
  const where = specialtyId ? { specialtyId } : {};

  const branches = await prisma.branch.findMany({
    where,
    orderBy: { name: "asc" },
    include: { _count: { select: { lessons: true } } },
  });
  return NextResponse.json(branches);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const { specialtyId, name, slug } = await req.json();
    const branch = await prisma.branch.create({
      data: { specialtyId, name, slug },
    });
    return NextResponse.json(branch, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "المعرف موجود مسبقاً في هذا التخصص" }, { status: 409 });
    }
    return NextResponse.json({ error: "فشل إنشاء الشعبة" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  await prisma.branch.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
