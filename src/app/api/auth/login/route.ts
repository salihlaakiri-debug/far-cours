import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit";

const SECRET = process.env.AUTH_SECRET || "fallback-secret";

export async function POST(req: NextRequest) {
  try {
    const { name, academicYear, matricule } = await req.json();

    if (!name || !academicYear || !matricule) {
      return NextResponse.json({ message: "الاسم الكامل والسنة الدراسية والمعرف الرقمي مطلوبون" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { militaryId: matricule.toUpperCase() } });
    if (!user) {
      await logAudit({ action: "LOGIN_FAILED", metadata: { matricule, reason: "user_not_found" } });
      return NextResponse.json({ message: "البيانات المدخلة غير صحيحة" }, { status: 401 });
    }

    if (!user.active) {
      await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "inactive" } });
      return NextResponse.json({ message: "الحساب غير نشط" }, { status: 401 });
    }

    if (user.name !== name || user.academicYear !== academicYear) {
      await logAudit({ userId: user.id, action: "LOGIN_FAILED", metadata: { matricule, reason: "name_or_year_mismatch" } });
      return NextResponse.json({ message: "البيانات المدخلة غير صحيحة" }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    await logAudit({ userId: user.id, action: "LOGIN_SUCCESS", metadata: { matricule } });

    const token = jwt.sign(
      { id: user.id, militaryId: user.militaryId, role: user.role },
      SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        militaryId: user.militaryId,
        fullName: user.name,
        rank: user.rank,
        role: user.role,
        specialty: user.specialty,
      },
    });
  } catch (err) {
    console.error("Login API error:", err);
    return NextResponse.json({ message: "خطأ في الخادم" }, { status: 500 });
  }
}
