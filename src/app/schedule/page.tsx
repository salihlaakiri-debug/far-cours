import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const DAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function getMonday(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function getWeekNumber(d: Date) {
  const start = new Date(2026, 0, 1);
  const diff = d.getTime() - start.getTime();
  const num = Math.ceil(diff / (7 * 86400000));
  return num > 0 ? num : 1;
}

function weekStartKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { view } = await searchParams;
  const isListView = view === "list";

  const branches = await prisma.branch.findMany({
    include: {
      weeklySchedules: {
        where: { status: "PUBLISHED" },
        include: { _count: { select: { sessions: true } } },
        orderBy: { weekStart: "desc" },
      },
    },
  });

  const now = new Date();
  const currentMonday = getMonday(now);
  const currentKey = weekStartKey(currentMonday);

  const allWeeks = branches
    .flatMap((b) =>
      b.weeklySchedules.map((w) => ({
        id: w.id,
        weekStart: w.weekStart,
        weekKey: weekStartKey(w.weekStart),
      }))
    )
    .sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

  const navIndex = allWeeks.findIndex((w) => w.weekKey === currentKey);
  const prevWeek = navIndex > 0 ? allWeeks[navIndex - 1] : null;
  const nextWeek = navIndex >= 0 && navIndex < allWeeks.length - 1 ? allWeeks[navIndex + 1] : null;

  const totalPublished = allWeeks.length;

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
        <div className="mb-6 animate-fade-up">
          <Link href="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة
          </Link>
        </div>

        <div className="animate-scale-in mb-8 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1.5 shadow-lg ring-1 ring-[#d4a843]/20">
                <img src="/ERB.png" alt="ERB" className="h-full w-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-[#d4a843]">جدول الحصص الأسبوعي</h1>
                <p className="text-sm text-[#94a3b8]">سلاح المدرعات — {totalPublished} جدول منشور</p>
              </div>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#0f172a]/60 p-0.5 ring-1 ring-[#334155]/50">
              <Link
                href="/schedule?view=grid"
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  !isListView
                    ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                    : "text-[#64748b] hover:text-[#94a3b8]"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                شبكي
              </Link>
              <Link
                href="/schedule?view=list"
                className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isListView
                    ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                    : "text-[#64748b] hover:text-[#94a3b8]"
                }`}
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                قائمة
              </Link>
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        {(prevWeek || nextWeek) && (
          <div className="animate-fade-up mb-6 flex items-center justify-between rounded-xl border border-[#334155]/40 bg-[#1e293b]/40 px-4 py-2.5 backdrop-blur-sm">
            <div>
              {prevWeek ? (
                <Link
                  href={`/schedule/${prevWeek.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#64748b] transition-colors hover:text-[#d4a843]"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  الأسبوع السابق
                </Link>
              ) : (
                <span />
              )}
            </div>
            <span className="text-[10px] text-[#64748b]" />
            <div>
              {nextWeek ? (
                <Link
                  href={`/schedule/${nextWeek.id}`}
                  className="inline-flex items-center gap-1.5 text-xs text-[#64748b] transition-colors hover:text-[#d4a843]"
                >
                  الأسبوع التالي
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        )}

        {branches.map((branch) => (
          <div key={branch.id} className="mb-8">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#94a3b8] tracking-wider">
              <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {branch.name}
              <span className="mr-auto text-[10px] font-normal text-[#64748b]">{branch.weeklySchedules.length} جدول</span>
            </h2>
            {branch.weeklySchedules.length === 0 && (
              <p className="text-sm text-[#64748b]">لا توجد جداول منشورة بعد</p>
            )}
            {isListView ? (
              <div className="space-y-3">
                {branch.weeklySchedules.map((w) => {
                  const end = new Date(w.weekStart);
                  end.setDate(end.getDate() + 4);
                  const weekNum = getWeekNumber(w.weekStart);
                  const isCurrentWeek = weekStartKey(w.weekStart) === currentKey;
                  return (
                    <Link
                      key={w.id}
                      href={`/schedule/${w.id}`}
                      className={`group flex items-center gap-4 rounded-xl border bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
                        isCurrentWeek
                          ? "border-[#d4a843]/50 ring-1 ring-[#d4a843]/20"
                          : "border-[#334155]/40 hover:border-[#d4a843]/30"
                      }`}
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#d4a843]/10 text-sm font-bold text-[#d4a843]">
                        {weekNum}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[#f1f5f9]">{formatDate(w.weekStart)}</span>
                          <span className="text-[10px] text-[#64748b]">—</span>
                          <span className="text-sm text-[#64748b]">{formatDate(end)}</span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-3 text-[10px] text-[#64748b]">
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {w._count.sessions} حصة
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="h-3 w-3 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {DAYS[0]} — {DAYS[4]}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="rounded bg-[#22c55e]/10 px-2 py-0.5 text-[9px] font-medium text-[#22c55e] tracking-wider">PUBLIÉ</span>
                        {isCurrentWeek && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#d4a843]/20">
                            <svg className="h-2.5 w-2.5 text-[#d4a843]" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                          </span>
                        )}
                        <svg className="h-4 w-4 text-[#334155] transition-colors group-hover:text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {branch.weeklySchedules.map((w) => {
                  const end = new Date(w.weekStart);
                  end.setDate(end.getDate() + 4);
                  const weekNum = getWeekNumber(w.weekStart);
                  const isCurrentWeek = weekStartKey(w.weekStart) === currentKey;
                  return (
                    <Link
                      key={w.id}
                      href={`/schedule/${w.id}`}
                      className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 ${
                        isCurrentWeek
                          ? "border-[#d4a843]/50 ring-1 ring-[#d4a843]/20"
                          : "border-[#334155]/40 hover:border-[#d4a843]/30"
                      }`}
                    >
                      <div className="absolute left-0 top-0 rounded-bl-2xl rounded-tr-2xl bg-[#d4a843]/10 px-2.5 py-1 text-[10px] font-bold text-[#d4a843]">
                        الأسبوع {weekNum}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#d4a843]">{DAYS[0]} — {DAYS[4]}</span>
                        <span className="rounded bg-[#22c55e]/10 px-2 py-0.5 text-[9px] font-medium text-[#22c55e] tracking-wider">PUBLIÉ</span>
                      </div>
                      <div className="mt-4 text-sm font-medium text-[#f1f5f9]">{formatDate(w.weekStart)} — {formatDate(end)}</div>
                      <div className="mt-3 flex items-center gap-3 text-[10px] text-[#64748b]">
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {w._count.sessions} حصة
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="h-3 w-3 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {DAYS[0]} — {DAYS[4]}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        {isCurrentWeek ? (
                          <span className="text-[9px] font-bold text-[#d4a843] tracking-wider">● الأسبوع الجاري</span>
                        ) : (
                          <span />
                        )}
                        <svg className="h-4 w-4 text-[#334155] transition-colors group-hover:text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      {isCurrentWeek && (
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-[#d4a843]/5 to-transparent pointer-events-none" />
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • EMPLOI DU TEMPS
        </div>
      </div>
    </div>
  );
}
