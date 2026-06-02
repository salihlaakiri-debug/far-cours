import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

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

export default async function InstructorSchedulePage() {
  const session = await auth();
  if (!session?.user || (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN")) {
    redirect("/");
  }

  const dbSessions = await prisma.session.findMany({
    where: { instructorName: session.user.name },
    include: {
      weeklySchedule: {
        include: {
          branch: { select: { id: true, name: true, slug: true } },
        },
      },
    },
    orderBy: [
      { weeklySchedule: { weekStart: "asc" } },
      { date: "asc" },
      { startTime: "asc" },
    ],
  });

  const weeksMap = new Map<string, { week: typeof dbSessions[number]["weeklySchedule"]; sessions: typeof dbSessions }>();
  for (const s of dbSessions) {
    const key = s.weeklySchedule.id;
    if (!weeksMap.has(key)) {
      weeksMap.set(key, { week: s.weeklySchedule, sessions: [] });
    }
    weeksMap.get(key)!.sessions.push(s);
  }
  const weeks = Array.from(weeksMap.entries()).map(([id, data]) => ({
    id,
    week: data.week,
    sessions: data.sessions,
  }));

  const minTime = 8 * 60;
  const maxTime = 17 * 60;
  const totalMin = maxTime - minTime;
  const dayHeight = 700;
  const pxPerMin = dayHeight / totalMin;

  if (weeks.length === 0) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
          <Link
            href="/instructor"
            className="mb-6 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة للوحة التحكم
          </Link>
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155]/40 py-20">
            <svg className="mb-4 h-14 w-14 text-[#334155]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-[#64748b]">لا توجد حصص مجدولة</p>
            <p className="mt-1 text-[10px] text-[#334155]">سيتم عرض الحصص هنا عند جدولتها</p>
          </div>
          <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
            ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ESPACE FORMATEUR
          </div>
        </div>
      </div>
    );
  }

  const totalSessions = dbSessions.length;
  const uniqueBranches = new Set(weeks.map((w) => w.week.branch.name));

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="fixed inset-0 opacity-[0.12]">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-[#2563eb] blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-[#d4a843] blur-[140px]" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
        <div className="mb-6 animate-fade-up space-y-4">
          <Link
            href="/instructor"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            العودة للوحة التحكم
          </Link>

          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1 shadow-lg ring-1 ring-[#d4a843]/20">
                  <Image src="/ERB.png" alt="ERB" width={300} height={359} className="h-full w-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-[#2563eb]/10 px-2 py-0.5 text-[11px] font-bold text-[#2563eb] tracking-widest">
                      SCHEDULE
                    </span>
                    <span className="rounded-md bg-[#d4a843]/10 px-2 py-0.5 text-[11px] font-bold text-[#d4a843] tracking-widest">
                      {session.user.rank} / {session.user.name}
                    </span>
                  </div>
                  <h1 className="mt-1 text-base font-extrabold text-[#f1f5f9] sm:text-lg">برنامج الحصص</h1>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <div className="text-lg font-extrabold text-[#d4a843]">{weeks.length}</div>
                  <div className="text-[9px] text-[#64748b] tracking-wider">أسبوع</div>
                </div>
                <div className="text-left">
                  <div className="text-lg font-extrabold text-[#22c55e]">{totalSessions}</div>
                  <div className="text-[9px] text-[#64748b] tracking-wider">حصّة</div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-[#334155]/40 px-4 py-2.5 sm:px-5">
              <span className="flex items-center gap-1 text-[10px] text-[#64748b]">
                <svg className="h-3 w-3 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {Array.from(uniqueBranches).join("، ")}
              </span>
            </div>
            <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
          </div>
        </div>

        {weeks.map(({ id, week, sessions: weekSessions }, wi) => {
          const weekEnd = new Date(week.weekStart);
          weekEnd.setDate(weekEnd.getDate() + 4);

          const sessionsByDay = DAYS.map((_, dayIdx) => {
            const d = new Date(week.weekStart);
            d.setDate(d.getDate() + dayIdx);
            return weekSessions.filter((s) => {
              const sd = new Date(s.date);
              return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
            });
          });

          return (
            <div key={id} className="mb-8 animate-fade-up" style={{ animationDelay: `${wi * 0.08}s` }}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold text-[#d4a843]">
                  الأسبوع {Math.ceil((week.weekStart.getTime() - new Date(2026, 0, 1).getTime()) / (7 * 86400000))}
                </h2>
                <span className="text-[10px] text-[#64748b]">{formatDate(week.weekStart)} — {formatDate(weekEnd)}</span>
                <span className="rounded bg-[#334155]/40 px-2 py-0.5 text-[9px] font-mono text-[#64748b]">{week.branch.name}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#d4a843]/30 to-transparent" />
              </div>

              <p className="sm:hidden mb-2 text-[10px] text-[#64748b] tracking-wider">اسحب لليمين لعرض الجدول الكامل ←</p>

              <div className="overflow-x-auto rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
                <div className="min-w-[820px]">
                  <div className="flex border-b border-[#334155]/40">
                    <div className="w-16 shrink-0 border-l border-[#334155]/40 p-2" />
                    {DAYS.map((day, i) => {
                      const dayDate = new Date(week.weekStart);
                      dayDate.setDate(dayDate.getDate() + i);
                      return (
                        <div key={day} className="flex-1 border-l border-[#334155]/40 p-2 text-center last:border-l-0">
                          <div className="text-xs font-bold text-[#d4a843]">{day}</div>
                          <div className="text-[10px] text-[#64748b]">{formatDate(dayDate)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="relative flex" style={{ height: `${dayHeight}px` }}>
                    <div className="w-16 shrink-0 border-l border-[#334155]/40">
                      {Array.from({ length: 10 }, (_, i) => {
                        const hour = i + 8;
                        return (
                          <div
                            key={hour}
                            className="flex items-start justify-center border-b border-[#334155]/10"
                            style={{ height: `${pxPerMin * 60}px` }}
                          >
                            <span className="text-[9px] text-[#64748b]">{`${String(hour).padStart(2, "0")}:00`}</span>
                          </div>
                        );
                      })}
                    </div>
                    {DAYS.map((_, di) => {
                      const daySessions = sessionsByDay[di];
                      return (
                        <div
                          key={di}
                          className="relative flex-1 border-l border-[#334155]/40 last:border-l-0"
                          style={{ height: `${dayHeight}px` }}
                        >
                          {daySessions.length === 0 && (
                            <div className="flex h-full items-center justify-center">
                              <span className="text-[9px] text-[#334155] tracking-wider">—</span>
                            </div>
                          )}
                          {daySessions.map((s) => {
                            const sStart = timeToMinutes(s.startTime);
                            const sEnd = timeToMinutes(s.endTime);
                            const duration = sEnd - sStart;
                            const top = (sStart - minTime) * pxPerMin;
                            const height = Math.max(duration * pxPerMin, 28);
                            const tc = getTypeConfig(s.sessionType);
                            return (
                              <div
                                key={s.id}
                                className={`group absolute right-0.5 left-0.5 z-10 overflow-hidden rounded-lg border ${tc.bg} ${tc.border} transition-all duration-150 hover:z-20 hover:shadow-lg hover:shadow-black/30 hover:scale-[1.02]`}
                                style={{ top: `${top}px`, height: `${height}px` }}
                              >
                                <div className="flex h-full flex-col justify-between p-1.5 sm:p-2">
                                  <div>
                                    <div className="flex items-center gap-1">
                                      <span className={`text-[9px] font-bold leading-tight text-[#f1f5f9] ${tc.text}`}>
                                        {s.title}
                                      </span>
                                      <span className={`mr-auto rounded px-1 py-0.5 text-[7px] font-medium tracking-wider ${tc.badge}`}>
                                        {tc.label}
                                      </span>
                                    </div>
                                    {s.subtitle && (
                                      <div className="mt-0.5 text-[8px] text-[#64748b] leading-tight">
                                        {s.subtitle}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[8px] text-[#94a3b8]">
                                    <span className="flex items-center gap-0.5">
                                      <svg className="h-2.5 w-2.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                                    </span>
                                    {s.room && (
                                      <span className="flex items-center gap-0.5" title={s.room}>
                                        <svg className="h-2.5 w-2.5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        <span>{s.room}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className={`absolute right-0 top-0 h-full w-0.5 ${tc.border.replace("border", "bg")}`} style={{ borderLeftColor: 'transparent' }} />
                              </div>
                            );
                          })}
                          {Array.from({ length: 10 }, (_, i) => (
                            <div
                              key={`hl-${di}-${i}`}
                              className="border-b border-[#334155]/10"
                              style={{ height: `${pxPerMin * 60}px` }}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ESPACE FORMATEUR
        </div>
      </div>
    </div>
  );
}
