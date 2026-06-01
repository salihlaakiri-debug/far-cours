import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const periods = await prisma.academicPeriod.findMany({
    orderBy: { startDate: "desc" },
    include: { _count: { select: { enrollments: true, instructorAssignments: true } } },
  });
  return NextResponse.json(periods);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { name, slug, startDate, endDate, isActive } = await req.json();
  const period = await prisma.academicPeriod.create({
    data: { name, slug, startDate: new Date(startDate), endDate: new Date(endDate), isActive },
  });
  return NextResponse.json(period);
}

export async function PATCH(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) data.slug = body.slug;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const period = await prisma.academicPeriod.update({
    where: { id },
    data,
  });
  return NextResponse.json(period);
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await prisma.academicPeriod.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
