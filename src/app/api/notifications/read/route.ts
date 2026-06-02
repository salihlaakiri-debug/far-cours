import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "المعرف مطلوب" }, { status: 400 });
  }

  await prisma.notification.updateMany({
    where: { id, userId: session.user.id },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
