"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

interface Session {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  title: string;
  subtitle: string | null;
  sessionType: string;
  instructorName: string | null;
  room: string | null;
  lessonId: string | null;
  sessionNum: number | null;
  isContinuation: boolean;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  branch: { id: string; name: string };
  sessions: Session[];
}

const dayNames = ["", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

const typeLabels: Record<string, string> = {
  COURS: "درس",
  TD: "تمارين",
  TP: "تطبيقي",
  EXAM: "امتحان",
};

const typeColors: Record<string, string> = {
  COURS: "bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20",
  TD: "bg-[#d4a843]/10 text-[#d4a843] border-[#d4a843]/20",
  TP: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
  EXAM: "bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20",
};

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/schedule/templates?id=${params.id}`);
      if (!res.ok) throw new Error("فشل تحميل القالب");
      const data = await res.json();
      setTemplate(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (params.id) loadTemplate();
  }, [params.id, loadTemplate]);

  const sortedDays = [1, 2, 3, 4, 5];

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/templates")}
        className="mb-4 flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        العودة إلى القوالب
      </button>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
          <svg className="h-5 w-5 shrink-0 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1 text-sm text-red-400">{error}</div>
          <button
            onClick={loadTemplate}
            className="rounded-lg bg-[#ef4444]/20 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Template info */}
      {template && !loading && (
        <>
          <div className="mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[#f1f5f9]">{template.name}</h1>
                {template.description && (
                  <p className="mt-1 text-sm text-[#94a3b8]">{template.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    {template.branch.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="h-3.5 w-3.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {template.sessions.length} جلسة
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions by day */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {sortedDays.map((day) => {
              const daySessions = template.sessions
                .filter((s) => s.dayOfWeek === day)
                .sort((a, b) => a.startTime.localeCompare(b.startTime));

              return (
                <div
                  key={day}
                  className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4"
                  style={{ animationDelay: `${day * 50}ms` }}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#334155]/40">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2563eb]/10 text-[#2563eb]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-[#f1f5f9]">{dayNames[day]}</h3>
                    <span className="mr-auto text-[10px] text-[#64748b]">{daySessions.length}</span>
                  </div>

                  {daySessions.length === 0 ? (
                    <p className="text-xs text-[#64748b] text-center py-4">لا توجد جلسات</p>
                  ) : (
                    <div className="space-y-2">
                      {daySessions.map((s) => (
                        <div
                          key={s.id}
                          className="rounded-xl border border-[#334155]/40 bg-[#0f172a]/60 p-2.5 transition-all hover:border-[#334155]/70"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-[#f1f5f9] truncate">{s.title}</p>
                              {s.subtitle && (
                                <p className="text-[10px] text-[#64748b] truncate">{s.subtitle}</p>
                              )}
                            </div>
                            <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium border ${typeColors[s.sessionType] || typeColors.COURS}`}>
                              {typeLabels[s.sessionType] || s.sessionType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-[#94a3b8]">
                            <span className="flex items-center gap-0.5">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {s.startTime} - {s.endTime}
                            </span>
                            {s.room && (
                              <span className="flex items-center gap-0.5">
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                                </svg>
                                {s.room}
                              </span>
                            )}
                          </div>
                          {s.instructorName && (
                            <div className="mt-1 flex items-center gap-0.5 text-[10px] text-[#2563eb]">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              {s.instructorName}
                            </div>
                          )}
                          {s.isContinuation && (
                            <span className="mt-1 inline-flex items-center gap-0.5 rounded bg-[#d4a843]/10 px-1.5 py-0.5 text-[9px] text-[#d4a843]">
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                              </svg>
                              تابع
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
