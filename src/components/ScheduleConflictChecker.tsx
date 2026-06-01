"use client";

import { useState, useEffect, useCallback } from "react";

interface Conflict {
  type: "INSTRUCTOR" | "ROOM";
  message: string;
  sessionIds: string[];
  severity: "ERROR" | "WARNING";
}

interface Props {
  weeklyScheduleId: string;
  refreshTrigger?: number;
}

const ICONS: Record<string, React.ReactNode> = {
  INSTRUCTOR: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  ROOM: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
};

export default function ScheduleConflictChecker({ weeklyScheduleId, refreshTrigger = 0 }: Props) {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(false);

  const check = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/schedule/conflicts?weeklyScheduleId=${weeklyScheduleId}`);
      const data = await res.json();
      setConflicts(data.conflicts || []);
    } catch {
      setConflicts([]);
    } finally {
      setLoading(false);
    }
  }, [weeklyScheduleId]);

  useEffect(() => {
    check();
  }, [refreshTrigger, check]);

  const errorCount = conflicts.filter((c) => c.severity === "ERROR").length;
  const warningCount = conflicts.filter((c) => c.severity === "WARNING").length;

  return (
    <div className="animate-fade-up mb-6 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span className="text-sm font-bold text-[#f1f5f9]">التعارضات</span>
          {loading && <span className="text-xs text-[#64748b]">جاري الفحص...</span>}
          {!loading && conflicts.length > 0 && (
            <span className="text-xs text-[#64748b]">
              ({errorCount} خطأ{errorCount !== 1 ? "اء" : ""}{warningCount > 0 ? `, ${warningCount} تحذير` : ""})
            </span>
          )}
          {!loading && conflicts.length === 0 && (
            <span className="text-xs text-[#22c55e]">لا توجد تعارضات ✓</span>
          )}
        </div>
        <button
          onClick={check}
          className="rounded-lg bg-[#334155]/50 px-2.5 py-1 text-xs text-[#94a3b8] hover:bg-[#334155] transition-colors"
        >
          إعادة الفحص
        </button>
      </div>
      {conflicts.length > 0 && <div className="h-px bg-[#334155]/40" />}
      <div className="p-3 space-y-2">
        {conflicts.map((c, i) => (
          <div
            key={`${c.sessionIds.join("-")}-${i}`}
            className="flex items-start gap-2.5 rounded-xl border p-2.5 animate-fade-up"
            style={{
              animationDelay: `${i * 50}ms`,
              borderColor: c.severity === "ERROR" ? "rgba(239,68,68,0.3)" : "rgba(245,158,11,0.3)",
              backgroundColor: c.severity === "ERROR" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)",
            }}
          >
            <div className={`mt-0.5 ${c.severity === "ERROR" ? "text-[#ef4444]" : "text-[#f59e0b]"}`}>
              {ICONS[c.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-medium ${c.severity === "ERROR" ? "text-[#ef4444]" : "text-[#f59e0b]"}`}>
                {c.type === "INSTRUCTOR" ? "تعارض أستاذ" : "تعارض قاعة"}
              </div>
              <div className="text-xs text-[#cbd5e1] mt-0.5">{c.message}</div>
              <div className="text-[10px] text-[#64748b] mt-1">
                الحصص: {c.sessionIds.join(", ")}
              </div>
            </div>
            <div
              className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                c.severity === "ERROR"
                  ? "bg-[#ef4444]/20 text-[#ef4444]"
                  : "bg-[#f59e0b]/20 text-[#f59e0b]"
              }`}
            >
              {c.severity === "ERROR" ? "خطأ" : "تحذير"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
