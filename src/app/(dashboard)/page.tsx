import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

type UserDisplayType = "ADMIN" | "INSTRUCTOR" | "STUDENT_Y1" | "STUDENT_Y2" | "ISTA";

function getUserDisplayType(role: string, academicYear: string | null): UserDisplayType {
  if (role === "ADMIN") return "ADMIN";
  if (role === "INSTRUCTOR") return "INSTRUCTOR";
  if (academicYear === "2024-2025") return "STUDENT_Y1";
  if (academicYear === "2025-2026") return "STUDENT_Y2";
  if (academicYear === "ISTA") return "ISTA";
  return "STUDENT_Y1";
}

async function AdminDashboard() {
  const [totalUsers, totalLessons, totalInstructors, recentLogs] = await Promise.all([
    prisma.user.count(),
    prisma.lesson.count(),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const logColors: Record<string, string> = {
    LOGIN_SUCCESS: "text-[#22c55e]",
    LOGIN_FAILED: "text-[#ef4444]",
  };

  return (
    <>
      <div className="animate-fade-up mb-6" style={{ animationDelay: "100ms" }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#f1f5f9]">لوحة الإدارة</h2>
          <p className="mt-1 text-sm text-[#94a3b8]">نظرة عامة على المنصة</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]/15">
                <svg className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">المستخدمون</span>
            </div>
            <p className="text-2xl font-bold text-[#f1f5f9]">{totalUsers}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">إجمالي الحسابات</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4a843]/15">
                <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">الدروس</span>
            </div>
            <p className="text-2xl font-bold text-[#d4a843]">{totalLessons}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">مادة أكاديمية</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]/15">
                <svg className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">المدربون</span>
            </div>
            <p className="text-2xl font-bold text-[#2563eb]">{totalInstructors}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">ملقن / أستاذ</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a855f7]/15">
                <svg className="h-4 w-4 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">السجلات</span>
            </div>
            <p className="text-2xl font-bold text-[#a855f7]">{recentLogs.length}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">آخر النشاطات</p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up mb-6" style={{ animationDelay: "150ms" }}>
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10">
          <div className="border-b border-[#334155]/40 px-5 py-4">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0-3.75-3.75M17.25 21 21 17.25" />
              </svg>
              <span className="text-sm font-bold text-[#d4a843]">آخر النشاطات</span>
            </div>
          </div>
          <div className="divide-y divide-[#334155]/40">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-medium ${logColors[log.action] || "text-[#94a3b8]"}`}>{log.action}</span>
                  <span className="text-[10px] text-[#64748b]">{formatDate(log.createdAt)}</span>
                </div>
                <span className="text-[10px] text-[#64748b]">{(log.metadata as { matricule?: string })?.matricule || "—"}</span>
              </div>
            ))}
            {recentLogs.length === 0 && (
              <div className="px-5 py-4 text-center text-xs text-[#64748b]">لا توجد سجلات بعد</div>
            )}
          </div>
        </div>
      </div>

      <div className="animate-fade-up mb-6" style={{ animationDelay: "200ms" }}>
        <h3 className="mb-3 text-sm font-bold tracking-wider text-[#64748b]">الإدارة</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/admin/users", label: "المستخدمون", icon: "users" },
            { href: "/admin/lessons", label: "الدروس", icon: "book" },
            { href: "/admin/templates", label: "القوالب", icon: "template" },
            { href: "/admin/schedule", label: "الجدول", icon: "calendar" },
            { href: "/admin/branches", label: "الشعب", icon: "branch" },
            { href: "/admin/specialties", label: "التخصصات", icon: "specialty" },
            { href: "/admin/enrollments", label: "التسجيلات", icon: "enroll" },
            { href: "/admin/progress", label: "التقدم", icon: "progress" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#d4a843]/30 hover:shadow-[#d4a843]/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4a843]/15">
                <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                </svg>
              </div>
              <span className="text-xs font-medium text-[#94a3b8]">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

async function InstructorDashboard({ userId }: { userId: string }) {
  const assignments = await prisma.instructorAssignment.findMany({
    where: { instructorId: userId },
    include: { branch: true },
  });

  const activePeriod = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
  });

  return (
    <>
      <div className="animate-fade-up mb-6" style={{ animationDelay: "100ms" }}>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-[#f1f5f9]">لوحة المدرب</h2>
          <p className="mt-1 text-sm text-[#94a3b8]">الشعب والمواد المسندة إليك</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]/15">
                <svg className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">الشعب</span>
            </div>
            <p className="text-2xl font-bold text-[#f1f5f9]">{assignments.length}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">شعبة مسندة</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4a843]/15">
                <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">الفترة</span>
            </div>
            <p className="text-sm font-bold text-[#d4a843]">{activePeriod?.name || "—"}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">النشاط الحالي</p>
          </div>
        </div>
      </div>

      {assignments.length > 0 ? (
        <div className="animate-fade-up mb-6 space-y-3" style={{ animationDelay: "150ms" }}>
          <h3 className="text-sm font-bold tracking-wider text-[#64748b]">الشعب المسندة</h3>
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/armor/${a.branch.slug}`}
              className="group block rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#2563eb]/30"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#f1f5f9] group-hover:text-[#2563eb]">{a.branch.name}</h4>
                  <p className="text-[10px] text-[#64748b]">{a.branch.slug}</p>
                </div>
                <svg className="h-4 w-4 text-[#64748b] group-hover:text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="animate-fade-up mb-6" style={{ animationDelay: "150ms" }}>
          <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-8 text-center shadow-lg shadow-black/10">
            <p className="text-sm text-[#64748b]">لم تسند إليك أي شعبة بعد</p>
          </div>
        </div>
      )}

      <div className="animate-fade-up mb-6" style={{ animationDelay: "200ms" }}>
        <h3 className="mb-3 text-sm font-bold tracking-wider text-[#64748b]">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link
            href="/instructor/schedule"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#2563eb]/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb]/15">
              <svg className="h-5 w-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#94a3b8]">الجدول</span>
          </Link>
          <Link
            href="/schedule"
            className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#d4a843]/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4a843]/15">
              <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#94a3b8]">الملف الشخصي</span>
          </Link>
        </div>
      </div>
    </>
  );
}

async function StudentDashboard({ userId }: { userId: string }) {
  const specialty = await prisma.specialty.findUnique({
    where: { slug: "armor" },
    include: {
      branches: {
        include: {
          _count: { select: { lessons: true } },
          lessons: { select: { id: true }, orderBy: { id: "asc" } },
        },
        orderBy: { id: "asc" },
      },
    },
  });

  if (!specialty) return null;

  const progress = await prisma.userProgress.findMany({
    where: { userId },
    select: { lessonId: true, completedAt: true },
  });
  const completedSet = new Set(progress.filter((p) => p.completedAt).map((p) => p.lessonId));

  const activePeriod = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
    include: {
      lessonSchedules: {
        include: { lesson: { include: { branch: true } } },
        orderBy: { startDate: "asc" },
      },
    },
  });

  const myEnrollment = activePeriod
    ? await prisma.enrollment.findUnique({
        where: { userId_academicPeriodId: { userId, academicPeriodId: activePeriod.id } },
        include: { instructor: { select: { name: true, rank: true } } },
      })
    : null;

  const now = new Date();
  const currentLessons = activePeriod?.lessonSchedules.filter(
    (s) => s.startDate <= now && s.endDate >= now
  ) || [];
  const upcomingLessons = activePeriod?.lessonSchedules.filter(
    (s) => s.startDate > now
  ).slice(0, 3) || [];

  const totalLessons = specialty.branches.reduce((sum, b) => sum + b._count.lessons, 0);
  const completedLessons = completedSet.size;
  const inProgressLessons = currentLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return (
    <>
      <div className="animate-fade-up mb-6" style={{ animationDelay: "100ms" }}>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#f1f5f9]">مرحبا</h2>
            <p className="mt-1 text-sm text-[#94a3b8]">نظرة عامة على تقدمك الأكاديمي</p>
          </div>
          <div className="mt-2 flex items-center gap-2 sm:mt-0">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#334155]/40 bg-[#1e293b]/50 px-3.5 py-2 text-xs font-medium text-[#94a3b8] transition-all hover:border-[#2563eb]/30 hover:text-[#2563eb]"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              الملف الشخصي
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]/15">
                <svg className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">المجموع</span>
            </div>
            <p className="text-2xl font-bold text-[#f1f5f9]">{totalLessons}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">المواد الأكاديمية</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/15">
                <svg className="h-4 w-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">المكتملة</span>
            </div>
            <p className="text-2xl font-bold text-[#22c55e]">{completedLessons}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">{totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}% من المجموع</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4a843]/15">
                <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">الحالية</span>
            </div>
            <p className="text-2xl font-bold text-[#d4a843]">{inProgressLessons}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">دروس جارية الآن</p>
          </div>
          <div className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#a855f7]/15">
                <svg className="h-4 w-4 text-[#a855f7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium tracking-wider text-[#64748b]">التقدم</span>
            </div>
            <p className="text-2xl font-bold text-[#a855f7]">{progressPct}%</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">الإجمالي العام</p>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <div className="animate-fade-up lg:col-span-2" style={{ animationDelay: "150ms" }}>
          <div className="h-full rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
            {activePeriod ? (
              <>
                <div className="flex items-center justify-between border-b border-[#334155]/40 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <div>
                      <span className="text-sm font-bold text-[#d4a843]">{activePeriod.name}</span>
                      <p className="text-[10px] text-[#64748b]">{formatDate(activePeriod.startDate)} — {formatDate(activePeriod.endDate)}</p>
                    </div>
                  </div>
                  <Link href="/schedule" className="text-[11px] font-medium text-[#2563eb] transition-colors hover:text-[#60a5fa]">عرض الكل</Link>
                </div>
                <div className="divide-y divide-[#334155]/40">
                  {myEnrollment?.instructor && (
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                        </svg>
                        <span className="text-xs text-[#94a3b8]">المدرب المسؤول</span>
                      </div>
                      <span className="text-xs font-medium text-[#f1f5f9]">{myEnrollment.instructor.rank} / {myEnrollment.instructor.name}</span>
                    </div>
                  )}
                  {currentLessons.length > 0 && (
                    <div className="px-5 py-3">
                      <div className="mb-3 flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" />
                        <span className="text-[11px] font-medium text-[#22c55e]">جاري حالياً</span>
                      </div>
                      <div className="space-y-2">
                        {currentLessons.slice(0, 2).map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg bg-[#0f172a]/50 px-3 py-2">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#22c55e]/10">
                                <svg className="h-3 w-3 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-sm text-[#f1f5f9]">{s.lesson.title}</span>
                                <span className="mr-2 text-[10px] text-[#64748b]">({s.lesson.branch.name})</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-[#64748b]">حتى {formatDate(s.endDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {currentLessons.length === 0 && (
                    <div className="px-5 py-4 text-center"><p className="text-xs text-[#64748b]">لا توجد دروس جارية حالياً</p></div>
                  )}
                  {upcomingLessons.length > 0 && (
                    <div className="px-5 py-3">
                      <span className="mb-3 block text-[11px] font-medium text-[#64748b]">المواد القادمة</span>
                      <div className="space-y-2">
                        {upcomingLessons.map((s) => (
                          <div key={s.id} className="flex items-center justify-between rounded-lg px-3 py-2 transition-colors hover:bg-[#0f172a]/30">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#2563eb]/10">
                                <svg className="h-3 w-3 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                              </div>
                              <div>
                                <span className="text-sm text-[#94a3b8]">{s.lesson.title}</span>
                                <span className="mr-2 text-[10px] text-[#64748b]">({s.lesson.branch.name})</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-[#64748b]">{formatDate(s.startDate)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {upcomingLessons.length === 0 && (
                    <div className="border-t border-[#334155]/40 px-5 py-4 text-center"><p className="text-xs text-[#64748b]">لا توجد مواد قادمة مجدولة</p></div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <svg className="mx-auto mb-3 h-10 w-10 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
                <p className="text-sm text-[#64748b]">لا توجد فترة أكاديمية نشطة</p>
              </div>
            )}
          </div>
        </div>

        <div className="animate-fade-up space-y-3" style={{ animationDelay: "200ms" }}>
          {specialty.branches.map((branch) => {
            const total = branch._count.lessons;
            const completed = branch.lessons.filter((l) => completedSet.has(l.id)).length;
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
            const r = 15.5;
            const circumference = 2 * Math.PI * r;
            const offset = circumference - (pct / 100) * circumference;
            const gradientId = `branchGrad-${branch.id}`;

            return (
              <Link
                key={branch.id}
                href={`/${specialty.slug}/${branch.slug}`}
                className="group block rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:translate-y-[-2px] hover:border-[#d4a843]/30 hover:shadow-xl hover:shadow-[#d4a843]/5"
              >
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r={r} fill="none" stroke="#334155" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r={r} fill="none" stroke={`url(#${gradientId})`} strokeWidth="2.5" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                      <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#d4a843" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold text-[#d4a843]">{pct}%</span>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#d4a843]/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-[#d4a843]">
                        {branch.slug === "premiere-annee" ? "1A" : branch.slug === "deuxieme-annee" ? "2A" : "—"}
                      </span>
                    </div>
                    <h3 className="mt-1 text-sm font-bold text-[#f1f5f9] transition-colors group-hover:text-[#d4a843]">{branch.name}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-[11px] text-[#94a3b8]">{completed}/{total}</span>
                      <span className="text-[9px] tracking-wider text-[#64748b]">MATIÈRES</span>
                    </div>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-[#64748b] transition-colors group-hover:text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="animate-fade-up mb-6" style={{ animationDelay: "250ms" }}>
        <h3 className="mb-3 text-sm font-bold tracking-wider text-[#64748b]">إجراءات سريعة</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/schedule" className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#2563eb]/30 hover:shadow-[#2563eb]/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2563eb]/15">
              <svg className="h-5 w-5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#94a3b8]">الجدول الزمني</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center gap-2 rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-300 hover:translate-y-[-2px] hover:border-[#d4a843]/30 hover:shadow-[#d4a843]/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d4a843]/15">
              <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-[#94a3b8]">الملف الشخصي</span>
          </Link>
        </div>
      </div>
    </>
  );
}

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userType = getUserDisplayType(session.user.role, session.user.academicYear);

  const isStudent = userType === "STUDENT_Y1" || userType === "STUDENT_Y2" || userType === "ISTA";

  const userTypeLabels: Record<UserDisplayType, string> = {
    ADMIN: "مدير النظام",
    INSTRUCTOR: "ملقن / أستاذ",
    STUDENT_Y1: "تلميذ — السنة الأولى",
    STUDENT_Y2: "تلميذ — السنة الثانية",
    ISTA: "تكوين ISTA",
  };

  const userTypeColors: Record<UserDisplayType, string> = {
    ADMIN: "bg-[#d4a843]/10 text-[#d4a843]",
    INSTRUCTOR: "bg-[#2563eb]/10 text-[#2563eb]",
    STUDENT_Y1: "bg-[#22c55e]/10 text-[#22c55e]",
    STUDENT_Y2: "bg-[#a855f7]/10 text-[#a855f7]",
    ISTA: "bg-[#f59e0b]/10 text-[#f59e0b]",
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="fixed inset-0 opacity-[0.15]">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#2563eb] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#d4a843] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
        {/* ========== HEADER ========== */}
        <div
          className="animate-fade-up mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-xl shadow-black/20 backdrop-blur-sm sm:p-6"
          style={{ animationDelay: "0ms" }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1.5 shadow-lg ring-1 ring-[#d4a843]/20">
                <img src="/ERB.png" alt="ERB" className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-extrabold text-[#d4a843] sm:text-2xl">سلاح المدرعات</h1>
                  <span className="rounded-md bg-[#d4a843]/10 px-2 py-0.5 text-[10px] font-medium tracking-wider text-[#d4a843]">ARMOR CORPS</span>
                </div>
                <p className="mt-1 text-sm text-[#94a3b8]">منصة التكوين الأكاديمي — القوات المسلحة الملكية</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isStudent && (
                <Link href="/schedule" className="inline-flex items-center gap-2 rounded-xl border border-[#334155]/40 bg-[#1e293b]/80 px-4 py-2 text-sm font-medium text-[#94a3b8] shadow-lg transition-all hover:border-[#d4a843]/30 hover:text-[#d4a843]">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                  </svg>
                  الجدول
                </Link>
              )}
              {session.user.role === "ADMIN" && (
                <Link href="/admin" className="inline-flex items-center gap-2 rounded-xl border border-[#d4a843]/30 bg-[#d4a843]/10 px-4 py-2 text-sm font-medium text-[#d4a843] shadow-lg shadow-[#d4a843]/5 transition-all hover:bg-[#d4a843]/20">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                  </svg>
                  الإدارة
                </Link>
              )}
              {session.user.role === "INSTRUCTOR" && (
                <Link href="/instructor" className="inline-flex items-center gap-2 rounded-xl border border-[#2563eb]/30 bg-[#2563eb]/10 px-4 py-2 text-sm font-medium text-[#2563eb] shadow-lg shadow-[#2563eb]/5 transition-all hover:bg-[#2563eb]/20">
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                  </svg>
                  المدرب
                </Link>
              )}
              <LogoutButton />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#334155]/40 pt-4">
            <span className={`rounded-lg px-3 py-1 text-xs font-medium ${userTypeColors[userType]}`}>
              {userTypeLabels[userType]}
            </span>
            <span className="text-sm text-[#f1f5f9]">{session.user.name}</span>
            <span className="text-[10px] tracking-wider text-[#64748b]">
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* ========== ROLE-SPECIFIC CONTENT ========== */}
        {userType === "ADMIN" && <AdminDashboard />}
        {userType === "INSTRUCTOR" && <InstructorDashboard userId={session.user.id} />}
        {isStudent && <StudentDashboard userId={session.user.id} />}

        {/* ========== FOOTER ========== */}
        <div
          className="animate-fade-up mt-6 border-t border-[#334155]/40 pt-6 text-center text-[10px] leading-loose tracking-wider text-[#64748b]"
          style={{ animationDelay: "300ms" }}
        >
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ÉCOLE DES OFFICIERS • ARMES BLINDÉES
        </div>
      </div>
    </div>
  );
}
