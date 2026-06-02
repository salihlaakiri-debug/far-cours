import { NextRequest, NextResponse } from "next/server";
import { getApiAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const role = req.nextUrl.searchParams.get("role");
  const where: Prisma.UserWhereInput = {};
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      militaryId: true,
      name: true,
      rank: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      failedAttempts: true,
      lockedUntil: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { name, rank, militaryId, password, role, academicYear } = await req.json();
  if (!name || !rank || !militaryId) {
    return NextResponse.json({ error: "الاسم والرتبة والرقم العسكري مطلوبة" }, { status: 400 });
  }

  const data: Prisma.UserCreateInput = { name, rank, militaryId, role: role || "USER" };
  if (academicYear) data.academicYear = academicYear;
  if (password) data.password = await bcrypt.hash(password, 10);
  const created = await prisma.user.create({ data,
    select: {
      id: true,
      militaryId: true,
      name: true,
      rank: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      failedAttempts: true,
      lockedUntil: true,
    },
  });

  logAudit({
    userId: user.id,
    action: "USER_CREATE",
    metadata: { targetId: created.id, name, rank, role },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    role: "ADMIN",
    type: "USER_CREATED",
    title: "مستخدم جديد",
    message: `تم إنشاء حساب ${rank} ${name} (${created.militaryId})`,
    link: "/admin/users",
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const body = await req.json();
  const data: Prisma.UserUpdateInput = {};
  if (body.name) data.name = body.name;
  if (body.rank) data.rank = body.rank;
  if (body.militaryId) data.militaryId = body.militaryId;
  if (body.role) data.role = body.role;
  if (body.active !== undefined) data.active = body.active;
  if (body.academicYear) data.academicYear = body.academicYear;
  if (body.password) data.password = await bcrypt.hash(body.password, 10);

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      militaryId: true,
      name: true,
      rank: true,
      role: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      failedAttempts: true,
      lockedUntil: true,
    },
  });

  const hasActiveToggle = "active" in body;
  logAudit({
    userId: user.id,
    action: hasActiveToggle ? "USER_TOGGLE_ACTIVE" : "USER_UPDATE",
    metadata: { targetId: id, changes: Object.keys(body) },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    role: "ADMIN",
    type: "USER_UPDATED",
    title: "تحديث مستخدم",
    message: `تم تحديث بيانات المستخدم ${updated.name}`,
    link: "/admin/users",
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const user = await getApiAuth(req);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });

  const target = await prisma.user.findUnique({
    where: { id },
    select: { role: true },
  });
  if (!target) {
    return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  }

  if (target.role === "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount <= 1) {
      return NextResponse.json({ error: "لا يمكن حذف آخر مشرف" }, { status: 400 });
    }
  }

  const deletedUser = await prisma.user.delete({ where: { id } });

  logAudit({
    userId: user.id,
    action: "USER_DELETE",
    metadata: { targetId: id, name: deletedUser.name, militaryId: deletedUser.militaryId },
    ip: req.headers.get("x-forwarded-for") || undefined,
    userAgent: req.headers.get("user-agent") || undefined,
  });

  notifyUsers({
    role: "ADMIN",
    type: "USER_DELETED",
    title: "حذف مستخدم",
    message: `تم حذف ${deletedUser.rank} ${deletedUser.name}`,
    link: "/admin/users",
  });

  return NextResponse.json({ success: true });
}
