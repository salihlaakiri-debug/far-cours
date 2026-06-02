import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

const DAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const TYPE_CONFIG: Record<string, { bg: string; border: string; text: string; badge: string; label: string }> = {
  COURS: { bg: "bg-[#2563eb]/15", border: "border-[#2563eb]/30", text: "text-[#60a5fa]", badge: "bg-[#2563eb] text-white", label: "درس" },
  TD: { bg: "bg-[#22c55e]/15", border: "border-[#22c55e]/30", text: "text-[#4ade80]", badge: "bg-[#22c55e] text-white", label: "أعمال موجهة" },
  TP: { bg: "bg-[#f59e0b]/15", border: "border-[#f59e0b]/30", text: "text-[#fbbf24]", badge: "bg-[#f59e0b] text-white", label: "أعمال تطبيقية" },
  CONF: { bg: "bg-[#a855f7]/15", border: "border-[#a855f7]/30", text: "text-[#c084fc]", badge: "bg-[#a855f7] text-white", label: "محاضرة" },
};

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function getTypeConfig(type: string) {
  const key = type?.toUpperCase();
  return TYPE_CONFIG[key] || TYPE_CONFIG.COURS;
}

export default async function WeekViewPage({ params }: { params: Promise<{ weekId: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { weekId } = await params;

  const week = await prisma.weeklySchedule.findUnique({
    where: { id: weekId },
    include: {
      sessions: {
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              branch: {
                select: {
                  slug: true,
                  specialty: { select: { slug: true } },
                },
              },
            },
          },
        },
      },
      branch: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!week || (week.status !== "PUBLISHED" && session.user.role === "USER")) notFound();

  const branchWeeks = await prisma.weeklySchedule.findMany({
    where: { branchId: week.branch.id, status: "PUBLISHED" },
    select: { id: true, weekStart: true },
    orderBy: { weekStart: "asc" },
  });

  const currentIdx = branchWeeks.findIndex((w) => w.id === weekId);
  const prevWeek = currentIdx > 0 ? branchWeeks[currentIdx - 1] : null;
  const nextWeek = currentIdx >= 0 && currentIdx < branchWeeks.length - 1 ? branchWeeks[currentIdx + 1] : null;

  const sessionsByDay = DAYS.map((_, dayIdx) => {
    const d = new Date(week.weekStart);
    d.setDate(d.getDate() + dayIdx);
    return week.sessions.filter((s) => {
      const sd = new Date(s.date);
      return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
    });
  });

  const weekEnd = new Date(week.weekStart);
  weekEnd.setDate(weekEnd.getDate() + 4);

  const minTime = 8 * 60;
  const maxTime = 17 * 60;
  const totalMin = maxTime - minTime;
  const dayHeight = 700;
  const pxPerMin = dayHeight / totalMin;

  const hasTp = week.sessions.some((s) => s.sessionType?.toUpperCase() === "TP");
  const hasConf = week.sessions.some((s) => s.sessionType?.toUpperCase() === "CONF");
  const hasTd = week.sessions.some((s) => s.sessionType?.toUpperCase() === "TD");
  const hasCours = week.sessions.some((s) => s.sessionType?.toUpperCase() === "COURS" || !s.sessionType);

  const types: Array<{ key: string; bg: string; border: string; text: string; badge: string; label: string }> = [];
  if (hasCours) types.push({ key: "COURS", ...TYPE_CONFIG.COURS });
  if (hasTd) types.push({ key: "TD", ...TYPE_CONFIG.TD });
  if (hasTp) types.push({ key: "TP", ...TYPE_CONFIG.TP });
  if (hasConf) types.push({ key: "CONF", ...TYPE_CONFIG.CONF });
  const sessionTypesPresent = types;

  const uniqueInstructors = [...new Set(week.sessions.map((s) => s.instructorName).filter((x): x is string => Boolean(x)))];
  const uniqueRooms = [...new Set(week.sessions.map((s) => s.room).filter((x): x is string => Boolean(x)))];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          @page { margin: 1cm; size: landscape; }
        }
      `}</style>
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
        <div className="mb-6 animate-fade-up space-y-4">
          <div className="flex items-center justify-between print:hidden">
            <Link href="/schedule" className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              الجداول
            </Link>
            <PrintButton />
          </div>

          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow-none">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1 shadow-lg ring-1 ring-[#d4a843]/20 print:hidden">
                  <Image src="/ERB.png" alt="ERB" width={300} height={359} className="h-full w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-[#d4a843] sm:text-lg print:text-black">{week.branch.name}</h1>
                  <p className="text-xs text-[#94a3b8] sm:text-sm print:text-gray-600">{formatDate(week.weekStart)} — {formatDate(weekEnd)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-[#d4a843]/10 px-3 py-1 text-xs font-bold text-[#d4a843] tracking-widest print:bg-gray-200 print:text-black">
                  الأسبوع {Math.ceil((week.weekStart.getTime() - new Date(2026, 0, 1).getTime()) / (7 * 86400000))}
                </span>
                <span className="rounded bg-[#22c55e]/10 px-2 py-1 text-[10px] font-medium text-[#22c55e] tracking-wider print:bg-gray-200 print:text-black">PUBLIÉ</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between border-t border-[#334155]/40 px-4 py-2.5 sm:px-5 print:border-gray-300">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#64748b] print:text-gray-700">
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-[#2563eb] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {week.sessions.length} حصة
                </span>
                <span className="flex items-center gap-1">
                  <svg className="h-3 w-3 text-[#22c55e] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {uniqueInstructors.length} أستاذ
                </span>
                {uniqueRooms.length > 0 && (
                  <span className="flex items-center gap-1">
                    <svg className="h-3 w-3 text-[#d4a843] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {uniqueRooms.join("، ")}
                  </span>
                )}
              </div>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent print:hidden" />
          </div>

          <div className="flex items-center justify-between print:hidden">
            <div>
              {prevWeek ? (
                <Link
                  href={`/schedule/${prevWeek.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#334155]/40 bg-[#1e293b]/60 px-3 py-2 text-xs text-[#94a3b8] transition-all hover:border-[#d4a843]/30 hover:text-[#d4a843] backdrop-blur-sm"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="hidden sm:inline">الأسبوع السابق</span>
                </Link>
              ) : (
                <span />
              )}
            </div>
            <div>
              {nextWeek ? (
                <Link
                  href={`/schedule/${nextWeek.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#334155]/40 bg-[#1e293b]/60 px-3 py-2 text-xs text-[#94a3b8] transition-all hover:border-[#d4a843]/30 hover:text-[#d4a843] backdrop-blur-sm"
                >
                  <span className="hidden sm:inline">الأسبوع التالي</span>
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </Link>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            {sessionTypesPresent.map((t) => (
              <span key={t.key} className={`flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium ${t.bg} ${t.text}`}>
                <span className={`h-2 w-2 rounded-full ${t.badge.replace('text-white', '')}`} style={{ backgroundColor: 'currentColor' }} />
                {t.label}
              </span>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[9px] text-[#64748b]">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            مرر لترى التفاصيل
          </div>
        </div>

        <div className="animate-fade-up overflow-x-auto rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm print:border-gray-300 print:bg-white print:shadow-none">
          <div className="min-w-[820px]">
            <div className="flex border-b border-[#334155]/40 print:border-gray-300">
              <div className="w-16 shrink-0 border-l border-[#334155]/40 p-2 print:border-gray-300 print:bg-gray-100" />
              {DAYS.map((day, i) => {
                const dayDate = new Date(week.weekStart);
                dayDate.setDate(dayDate.getDate() + i);
                const isToday =
                  dayDate.getDate() === new Date().getDate() &&
                  dayDate.getMonth() === new Date().getMonth() &&
                  dayDate.getFullYear() === new Date().getFullYear();
                return (
                  <div
                    key={day}
                    className={`flex-1 border-l border-[#334155]/40 p-2 text-center last:border-l-0 print:border-gray-300 print:bg-gray-50 ${
                      isToday ? "bg-[#d4a843]/5" : ""
                    }`}
                  >
                    <div className={`text-xs font-bold ${isToday ? "text-[#d4a843]" : "text-[#d4a843]"} print:text-black`}>{day}</div>
                    <div className={`text-[10px] ${isToday ? "text-[#d4a843]" : "text-[#64748b]"} print:text-gray-700`}>
                      {formatDate(dayDate)}
                    </div>
                    {isToday && (
                      <div className="mx-auto mt-0.5 h-0.5 w-4 rounded-full bg-[#d4a843] print:bg-gray-400" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="relative flex" style={{ height: `${dayHeight}px` }}>
              <div className="w-16 shrink-0 border-l border-[#334155]/40 print:border-gray-300 print:bg-gray-100">
                {Array.from({ length: 10 }, (_, i) => {
                  const hour = i + 8;
                  return (
                    <div
                      key={hour}
                      className="flex items-start justify-center border-b border-[#334155]/10 print:border-gray-200"
                      style={{ height: `${pxPerMin * 60}px` }}
                    >
                      <span className="text-[9px] text-[#64748b] print:text-gray-600">{`${String(hour).padStart(2, "0")}:00`}</span>
                    </div>
                  );
                })}
              </div>
              {DAYS.map((_, di) => {
                const daySessions = sessionsByDay[di];
                return (
                  <div
                    key={di}
                    className="relative flex-1 border-l border-[#334155]/40 last:border-l-0 print:border-gray-300 print:bg-white"
                    style={{ height: `${dayHeight}px` }}
                  >
                    {daySessions.length === 0 && (
                      <div className="flex h-full items-center justify-center">
                        <span className="text-[9px] text-[#334155] tracking-wider print:text-gray-400">—</span>
                      </div>
                    )}
                    {daySessions.map((s) => {
                      const sStart = timeToMinutes(s.startTime);
                      const sEnd = timeToMinutes(s.endTime);
                      const duration = sEnd - sStart;
                      const top = (sStart - minTime) * pxPerMin;
                      const height = Math.max(duration * pxPerMin, 28);
                      const tc = getTypeConfig(s.sessionType);

                      const linkHref = s.lesson
                        ? `/${s.lesson.branch.specialty.slug}/${s.lesson.branch.slug}/${s.lesson.id}`
                        : null;

                      const blockClasses = `group absolute right-0.5 left-0.5 z-10 overflow-hidden rounded-lg border ${tc.bg} ${tc.border} transition-all duration-150 hover:z-20 hover:shadow-lg hover:shadow-black/30 hover:scale-[1.02] print:border-gray-400 ${linkHref ? 'cursor-pointer' : ''}`;

                      const inner = (
                        <>
                          <div className="flex h-full flex-col justify-between p-1.5 sm:p-2 print:p-1">
                            <div>
                              <div className="flex items-center gap-1">
                                <span className={`text-[9px] font-bold leading-tight text-[#f1f5f9] ${tc.text} print:text-gray-800`}>
                                  {s.title}
                                </span>
                                <span className={`mr-auto rounded px-1 py-0.5 text-[7px] font-medium tracking-wider ${tc.badge} print:bg-gray-300 print:text-gray-700`}>
                                  {tc.label}
                                </span>
                              </div>
                              {s.subtitle && (
                                <div className="mt-0.5 text-[8px] text-[#64748b] leading-tight print:text-gray-600">
                                  {s.subtitle}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px] text-[#94a3b8] print:text-gray-700">
                              <span className="flex items-center gap-0.5">
                                <svg className="h-2.5 w-2.5 text-[#2563eb] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                              </span>
                              {s.instructorName && (
                                <span className="flex items-center gap-0.5" title={s.instructorName}>
                                  <svg className="h-2.5 w-2.5 text-[#22c55e] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="hidden group-hover:inline print:inline">{s.instructorName}</span>
                                </span>
                              )}
                              {s.room && (
                                <span className="flex items-center gap-0.5" title={s.room}>
                                  <svg className="h-2.5 w-2.5 text-[#d4a843] print:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  <span className="hidden group-hover:inline print:inline">{s.room}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`absolute right-0 top-0 h-full w-0.5 ${tc.border.replace("border", "bg")} print:bg-gray-400`} style={{ borderLeftColor: 'transparent' }} />
                          {linkHref && (
                            <span className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity print:hidden">
                              <svg className="h-3 w-3 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </span>
                          )}
                        </>
                      );

                      if (linkHref) {
                        return (
                          <Link
                            key={s.id}
                            href={linkHref}
                            target="_blank"
                            className={blockClasses}
                            style={{ top: `${top}px`, height: `${height}px` }}
                          >
                            {inner}
                          </Link>
                        );
                      }

                      return (
                        <div
                          key={s.id}
                          className={blockClasses}
                          style={{ top: `${top}px`, height: `${height}px` }}
                        >
                          {inner}
                        </div>
                      );
                    })}
                    {Array.from({ length: 10 }, (_, i) => (
                      <div
                        key={`hl-${i}`}
                        className="border-b border-[#334155]/10 print:border-gray-200"
                        style={{ height: `${pxPerMin * 60}px` }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-[#334155]/40 bg-[#1e293b]/40 px-4 py-3 backdrop-blur-sm print:border-gray-300 print:bg-gray-50">
          <div className="flex flex-wrap items-center gap-3">
            {sessionTypesPresent.map((t) => (
              <span key={t.key} className="flex items-center gap-1.5 text-[10px] text-[#64748b] print:text-gray-700">
                <span className={`h-2.5 w-2.5 rounded-sm ${t.bg} ${t.border} border print:border-gray-400 print:bg-gray-300`} />
                {t.label}
              </span>
            ))}
          </div>
          <div className="mr-auto text-[10px] text-[#64748b] print:text-gray-700">
            {week.sessions.length} حصة • {uniqueInstructors.length} أستاذ
            {uniqueRooms.length > 0 && ` • ${uniqueRooms.join("، ")}`}
          </div>
        </div>

        <div className="mt-4 text-center print:hidden">
          <div className="sm:hidden mb-2">
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#2563eb]/10 px-3 py-1.5 text-[10px] text-[#60a5fa]">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              اسحب الجدول أفقيا لعرض جميع الأيام
            </span>
          </div>
          <div className="text-[10px] text-[#64748b] tracking-wider">
            ROYAUME DU MAROC • FORCES ARMÉES ROYALES • CONFIDENTIEL DÉFENSE
          </div>
        </div>
      </div>
    </div>
  );
}
