import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";
import { notifyUsers } from "@/lib/notify";
import { getStorage } from "@/lib/storage";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const branchId = formData.get("branchId") as string | null;
    const title = formData.get("title") as string | null;
    const description = formData.get("description") as string | null;
    const academicYear = formData.get("academicYear") as string | null;

    if (!file || !branchId || !title) {
      return NextResponse.json(
        { error: "الملف، معرف الشعبة، والعنوان مطلوبون" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "يجب أن يكون الملف بصيغة PDF" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "حجم الملف يتجاوز 100MB" },
        { status: 400 }
      );
    }

    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      include: { specialty: true },
    });

    if (!branch) {
      return NextResponse.json(
        { error: "الشعبة غير موجودة" },
        { status: 404 }
      );
    }

    const uuid = crypto.randomUUID();
    const pdfKey = `${branch.specialty.slug}/${branch.slug}/${uuid}.pdf`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorage();
    await storage.upload(pdfKey, buffer, "application/pdf", file.size);

    const lesson = await prisma.lesson.create({
      data: {
        branchId,
        academicYear: academicYear || undefined,
        title,
        description,
        pdfKey,
        pdfSize: file.size,
        order: (await prisma.lesson.count({ where: { branchId } })) + 1,
      },
    });

    await logAudit({
      userId: session.user.id,
      action: "PDF_UPLOAD",
      metadata: { lessonId: lesson.id, pdfKey, size: file.size },
    });

    notifyUsers({
      branchId,
      type: "LESSON_UPLOADED",
      title: "درس جديد",
      message: `تم رفع درس "${title}"`,
      link: "/",
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "فشل رفع الملف" }, { status: 500 });
  }
}
