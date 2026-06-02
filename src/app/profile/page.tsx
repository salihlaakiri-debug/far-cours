import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const roleLabels: Record<string, { label: string; color: string }> = {
  ADMIN: { label: "مدير", color: "bg-red-500/10 text-red-400 border-red-500/20" },
  INSTRUCTOR: { label: "مدرب", color: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20" },
  USER: { label: "متدرب", color: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20" },
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      rank: true,
      militaryId: true,
      role: true,
      specialty: true,
      academicYear: true,
      createdAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) redirect("/login");

  const activePeriod = await prisma.academicPeriod.findFirst({
    where: { isActive: true },
  });

  const [progress, totalLessons, enrollment] = await Promise.all([
    prisma.userProgress.findMany({
      where: { userId: user.id },
      include: {
        lesson: {
          include: { branch: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.lesson.count(),
    activePeriod
      ? prisma.enrollment.findUnique({
          where: {
            userId_academicPeriodId: {
              userId: user.id,
              academicPeriodId: activePeriod.id,
            },
          },
          include: {
            instructor: { select: { name: true, rank: true } },
            academicPeriod: { select: { name: true, startDate: true, endDate: true } },
          },
        })
      : null,
  ]);

  const completedCount = progress.filter((p) => p.completedAt).length;
  const inProgressCount = progress.filter((p) => !p.completedAt).length;
  const completionPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const recentActivity = progress.slice(0, 5);
  const roleMeta = roleLabels[user.role] || roleLabels.USER;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="fixed inset-0 opacity-[0.15]">
        <div className="absolute left-1/3 top-0 h-96 w-96 rounded-full bg-[#2563eb] blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-[#d4a843] blur-[160px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
        {/* Back link */}
        <div className="mb-6 animate-fade-up">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]"
          >
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى لوحة التحكم
          </Link>
        </div>

        {/* User Info Card */}
        <div className="animate-fade-up mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-2 shadow-lg ring-1 ring-[#d4a843]/20">
                <Image src="/ERB.png" alt="ERB" width={300} height={359} className="h-full w-full object-contain" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-extrabold text-[#f1f5f9] sm:text-2xl">{user.name}</h1>
                  <span className={`rounded-md border px-2.5 py-0.5 text-[11px] font-bold tracking-wider ${roleMeta.color}`}>
                    {roleMeta.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span className="rounded-lg bg-gradient-to-l from-[#d4a843]/20 to-transparent px-3 py-1 text-sm font-medium text-[#d4a843]">
                    {user.rank}
                  </span>
                  <span className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                    </svg>
                    {user.militaryId}
                  </span>
                  {user.academicYear && (
                    <span className="flex items-center gap-1.5 text-sm text-[#d4a843]/70">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {user.academicYear}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-[#334155]/40 bg-[#1e293b]/60 px-4 py-2 text-center">
                <div className="text-[10px] text-[#64748b] tracking-wider">مسجل منذ</div>
                <div className="mt-0.5 text-xs font-medium text-[#94a3b8]">{formatDate(user.createdAt)}</div>
              </div>
              {user.lastLoginAt && (
                <div className="rounded-xl border border-[#334155]/40 bg-[#1e293b]/60 px-4 py-2 text-center">
                  <div className="text-[10px] text-[#64748b] tracking-wider">آخر دخول</div>
                  <div className="mt-0.5 text-xs font-medium text-[#94a3b8]">{formatDateTime(user.lastLoginAt)}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            {
              label: "إجمالي المواد",
              value: totalLessons,
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
              ),
              color: "text-[#2563eb]",
              bg: "bg-[#2563eb]/10",
            },
            {
              label: "مكتمل",
              value: completedCount,
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              ),
              color: "text-[#22c55e]",
              bg: "bg-[#22c55e]/10",
            },
            {
              label: "قيد التقدم",
              value: inProgressCount,
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                </svg>
              ),
              color: "text-[#d4a843]",
              bg: "bg-[#d4a843]/10",
            },
            {
              label: "نسبة الإنجاز",
              value: `${completionPct}%`,
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
              ),
              color: "text-[#d4a843]",
              bg: "bg-[#d4a843]/10",
            },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-fade-up delay-${Math.min(i + 1, 5)} rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold text-[#f1f5f9]">{stat.value}</div>
                <div className="mt-0.5 text-[11px] text-[#64748b] tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="animate-fade-up delay-5 mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-[#f1f5f9]">التقدم العام</span>
            <span className="text-xs font-medium text-[#d4a843]">{completedCount}/{totalLessons} مادة</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#334155]/50">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#d4a843] to-[#2563eb] transition-all duration-1000 ease-out"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#64748b]">
            <span>{completionPct}%</span>
            <span className="tracking-wider">COMPLETION</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-[#334155]/40 px-5 py-3.5">
              <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              <span className="text-sm font-bold text-[#f1f5f9]">آخر الأنشطة</span>
            </div>
            {recentActivity.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10">
                <svg className="h-10 w-10 text-[#334155]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
                <span className="text-sm text-[#64748b]">لا توجد أنشطة بعد</span>
                <span className="text-[10px] text-[#475569] tracking-wider">ابدأ بتصفح المواد</span>
              </div>
            ) : (
              <div className="divide-y divide-[#334155]/40">
                {recentActivity.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#334155]/20">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-[#f1f5f9]">{p.lesson.title}</span>
                        <span className="shrink-0 text-[10px] text-[#64748b]">({p.lesson.branch.name})</span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-[#64748b]">
                        <span>{formatDateTime(p.updatedAt)}</span>
                        {p.lastPage > 0 && (
                          <span>الصفحة {p.lastPage}{p.lesson.pageCount ? ` / ${p.lesson.pageCount}` : ""}</span>
                        )}
                      </div>
                    </div>
                    <div className="mr-3 shrink-0">
                      {p.completedAt ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#22c55e]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#22c55e]">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                          </svg>
                          مكتمل
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#d4a843]/10 px-2.5 py-0.5 text-[10px] font-medium text-[#d4a843]">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                          </svg>
                          قيد التقدم
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Enrollment Info */}
          <div className="animate-fade-up delay-2 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-[#334155]/40 px-5 py-3.5">
              <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
              </svg>
              <span className="text-sm font-bold text-[#f1f5f9]">معلومات التسجيل</span>
            </div>
            {enrollment ? (
              <div className="divide-y divide-[#334155]/40">
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#94a3b8]">الفترة الأكاديمية</span>
                  <span className="text-xs font-medium text-[#d4a843]">{enrollment.academicPeriod.name}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#94a3b8]">تاريخ البداية</span>
                  <span className="text-xs text-[#f1f5f9]">{formatDate(enrollment.academicPeriod.startDate)}</span>
                </div>
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#94a3b8]">تاريخ النهاية</span>
                  <span className="text-xs text-[#f1f5f9]">{formatDate(enrollment.academicPeriod.endDate)}</span>
                </div>
                {enrollment.instructor ? (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-[#94a3b8]">المدرب المسؤول</span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-[#f1f5f9]">
                      <svg className="h-3.5 w-3.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
                      </svg>
                      {enrollment.instructor.rank} / {enrollment.instructor.name}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between px-5 py-3">
                    <span className="text-xs text-[#94a3b8]">المدرب المسؤول</span>
                    <span className="text-xs text-[#64748b]">غير معين</span>
                  </div>
                )}
                <div className="flex items-center justify-between px-5 py-3">
                  <span className="text-xs text-[#94a3b8]">تاريخ التسجيل</span>
                  <span className="text-xs text-[#f1f5f9]">{formatDate(enrollment.enrolledAt)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 px-5 py-10">
                <svg className="h-10 w-10 text-[#334155]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
                <span className="text-sm text-[#64748b]">غير مسجل في فترة نشطة</span>
                <span className="text-[10px] text-[#475569] tracking-wider">انتظر الفترة القادمة</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ÉCOLE DES OFFICIERS • ARMES BLINDÉES
        </div>
      </div>
    </div>
  );
}
