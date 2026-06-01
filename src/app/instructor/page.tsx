import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InstructorPage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const activePeriod = await prisma.academicPeriod.findFirst({ where: { isActive: true } });

  const assignments = await prisma.instructorAssignment.findMany({
    where: {
      instructorId: session.user.id,
      ...(activePeriod ? { academicPeriodId: activePeriod.id } : {}),
    },
    include: {
      branch: { include: { _count: { select: { lessons: true } } } },
      academicPeriod: true,
    },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { instructorId: session.user.id },
    include: {
      user: { select: { id: true, name: true, rank: true, militaryId: true } },
      academicPeriod: true,
    },
    orderBy: { enrolledAt: "desc" },
  });

  const uniqueTrainees = new Map(enrollments.map((e) => [e.user.id, e]));

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="fixed inset-0 opacity-[0.15]">
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-[#2563eb] blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#d4a843] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </Link>

          <div className="overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
            <div className="flex items-center gap-4 p-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1.5 shadow-lg ring-1 ring-[#d4a843]/20">
                <img src="/ERB.png" alt="ERB" className="h-full w-full object-contain" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#2563eb]/10 px-2 py-0.5 text-[11px] font-bold text-[#2563eb] tracking-widest">
                    INSTRUCTOR
                  </span>
                  {activePeriod && (
                    <span className="rounded-md bg-[#d4a843]/10 px-2 py-0.5 text-[11px] font-bold text-[#d4a843] tracking-widest">
                      {activePeriod.name}
                    </span>
                  )}
                </div>
                <h1 className="mt-1 text-xl font-extrabold text-[#f1f5f9]">
                  {session.user.rank} / {session.user.name}
                </h1>
                <p className="mt-0.5 text-sm text-[#94a3b8]">
                  منصة التكوين الأكاديمي — سلاح المدرعات
                </p>
              </div>
              <Link
                href="/instructor/schedule"
                className="inline-flex items-center gap-2 rounded-lg border border-[#334155]/40 bg-[#1e293b]/60 px-3 py-2 text-xs text-[#94a3b8] transition-all hover:border-[#d4a843]/30 hover:text-[#d4a843] backdrop-blur-sm shrink-0"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">برنامج الحصص</span>
              </Link>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-l from-[#2563eb] via-[#d4a843] to-transparent" />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          {[
            { label: "الأقسام المسندة", value: assignments.length, color: "text-[#2563eb]" },
            { label: "المتدربين", value: uniqueTrainees.size, color: "text-[#22c55e]" },
            { label: "المواد", value: assignments.reduce((s, a) => s + a.branch._count.lessons, 0), color: "text-[#d4a843]" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <div className={"text-xs font-bold " + stat.color}>{stat.label}</div>
              <div className={"text-lg font-extrabold mt-1 " + stat.color}>{stat.value}</div>
              <div className="text-[10px] text-[#64748b]">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Assigned branches */}
        <h2 className="mb-4 text-sm font-bold text-[#94a3b8] tracking-wider">الأقسام المسندة</h2>
        <div className="mb-8 space-y-3">
          {assignments.length === 0 && (
            <p className="text-sm text-[#64748b]">لا توجد أقسام مسندة للدورة الحالية</p>
          )}
          {assignments.map((a) => (
            <Link
              key={a.id}
              href={`/armor/${a.branch.slug}`}
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:border-[#2563eb]/30 hover:shadow-xl hover:shadow-[#2563eb]/5 hover:-translate-y-0.5"
            >
              <div className="relative flex-1">
                <h3 className="font-bold text-[#f1f5f9] transition-colors group-hover:text-[#2563eb]">{a.branch.name}</h3>
                <p className="mt-0.5 text-xs text-[#64748b]">{a.branch._count.lessons} مادة</p>
              </div>
              <span className="relative text-xs text-[#64748b]">{a.academicPeriod.name}</span>
            </Link>
          ))}
        </div>

        {/* Enrolled trainees */}
        <h2 className="mb-4 text-sm font-bold text-[#94a3b8] tracking-wider">المتدربون</h2>
        <div className="space-y-2">
          {uniqueTrainees.size === 0 && (
            <p className="text-sm text-[#64748b]">لا يوجد متدربون مسجلون بعد</p>
          )}
          {Array.from(uniqueTrainees.values()).map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-3 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a]/80 text-xs font-bold text-[#2563eb] ring-1 ring-[#334155]/30">
                {e.user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-[#f1f5f9]">{e.user.name}</div>
                <div className="text-[10px] text-[#64748b]">{e.user.rank} · {e.user.militaryId}</div>
              </div>
              <div className="text-[10px] text-[#64748b]">{e.academicPeriod.name}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ESPACE FORMATEUR
        </div>
      </div>
    </div>
  );
}
