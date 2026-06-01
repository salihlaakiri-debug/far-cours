"use client";

import { useState, useEffect, useCallback } from "react";

interface User {
  id: string;
  name: string;
  rank: string;
  militaryId: string;
}

interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  lastPage: number;
  totalPages: number;
  completedAt: string | null;
  viewCount: number;
  updatedAt: string;
  user: { id: string; name: string; rank: string; militaryId: string };
  lesson: { id: string; title: string; pageCount: number | null };
}

export default function AdminProgressPage() {
  const [progress, setProgress] = useState<Progress[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (selectedUser) params.set("userId", selectedUser);
      if (statusFilter === "completed") params.set("completed", "true");
      else if (statusFilter === "in_progress") params.set("completed", "false");
      const res = await fetch(`/api/lessons/progress?${params}`);
      if (!res.ok) throw new Error("فشل تحميل التقدم");
      const data = await res.json();
      setProgress(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [selectedUser, statusFilter]);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data: User[] = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const totalViews = progress.reduce((sum, p) => sum + p.viewCount, 0);
  const completedCount = progress.filter((p) => p.completedAt).length;
  const inProgressCount = progress.filter((p) => !p.completedAt).length;

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#f1f5f9]">تقدم المستخدمين</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">متابعة تقدم المستخدمين في المواد الدراسية</p>
      </div>

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb]/10">
              <svg className="h-4 w-4 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-xs text-[#94a3b8]">إجمالي المشاهدات</span>
          </div>
          <div className="text-2xl font-extrabold text-[#2563eb]">{totalViews}</div>
        </div>
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22c55e]/10">
              <svg className="h-4 w-4 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-[#94a3b8]">مكتملة</span>
          </div>
          <div className="text-2xl font-extrabold text-[#22c55e]">{completedCount}</div>
        </div>
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#d4a843]/10">
              <svg className="h-4 w-4 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs text-[#94a3b8]">قيد التقدم</span>
          </div>
          <div className="text-2xl font-extrabold text-[#d4a843]">{inProgressCount}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4">
        <svg className="h-4 w-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
        >
          <option value="">جميع المستخدمين</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.rank} {u.name}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
        >
          <option value="all">الكل</option>
          <option value="completed">مكتمل</option>
          <option value="in_progress">قيد التقدم</option>
        </select>
        {(selectedUser || statusFilter !== "all") && (
          <button
            onClick={() => { setSelectedUser(""); setStatusFilter("all"); }}
            className="rounded-lg border border-[#334155] px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            إلغاء التصفية
          </button>
        )}
        <span className="mr-auto text-xs text-[#64748b]">{progress.length} سجل</span>
      </div>

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
            onClick={loadProgress}
            className="rounded-lg bg-[#ef4444]/20 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && progress.length === 0 && (
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-10 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <p className="text-[#94a3b8]">لا توجد بيانات تقدم</p>
        </div>
      )}

      {/* Progress list */}
      {!loading && !error && progress.length > 0 && (
        <div className="space-y-3">
          {progress.map((p, i) => {
            const isCompleted = !!p.completedAt;
            const totalPages = p.lesson.pageCount || p.totalPages || 0;
            const progressPct = totalPages > 0 ? Math.round((p.lastPage / totalPages) * 100) : 0;

            return (
              <div
                key={p.id}
                className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 transition-all duration-200 hover:border-[#334155]/60"
                style={{ animationDelay: `${i * 30}ms` }}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ring-1 ${
                      isCompleted
                        ? "bg-[#22c55e]/10 text-[#22c55e] ring-[#22c55e]/20"
                        : "bg-[#d4a843]/10 text-[#d4a843] ring-[#d4a843]/20"
                    }`}>
                      {isCompleted ? (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#f1f5f9] truncate">{p.user.name}</span>
                        <span className="shrink-0 rounded-md bg-[#64748b]/20 px-2 py-0.5 text-[10px] font-medium text-[#94a3b8] border border-[#64748b]/30">
                          {p.user.rank}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-[#94a3b8] truncate">
                        {p.lesson.title}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-6">
                    {/* Progress bar */}
                    <div className="w-24 sm:w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-[#64748b]">التقدم</span>
                        <span className="text-[10px] text-[#94a3b8]">{p.lastPage}/{totalPages}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#334155]/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? "bg-[#22c55e]" : "bg-[#2563eb]"
                          }`}
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium border ${
                      isCompleted
                        ? "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20"
                        : "bg-[#d4a843]/10 text-[#d4a843] border-[#d4a843]/20"
                    }`}>
                      {isCompleted ? "مكتمل" : "قيد التقدم"}
                    </span>

                    {/* Last viewed */}
                    <div className="hidden sm:block text-[11px] text-[#64748b] min-w-[70px] text-left" dir="ltr">
                      {formatDate(p.updatedAt)}
                    </div>

                    {/* View count */}
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-[#64748b]">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.viewCount}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
