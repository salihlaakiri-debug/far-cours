"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


interface BranchMini {
  id: string;
  name: string;
}

interface TemplateItem {
  id: string;
  name: string;
  _count: { sessions: number };
}

interface WeekItem {
  id: string;
  branchId: string;
  weekStart: string;
  status: string;
  branch: { name: string; slug: string };
  _count: { sessions: number };
}

export default function AdminSchedulePage() {
  const router = useRouter();
  const [weeks, setWeeks] = useState<WeekItem[]>([]);
  const [branches, setBranches] = useState<BranchMini[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [branchId, setBranchId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [creating, setCreating] = useState(false);

  async function load() {
    const [wRes, bRes, tRes] = await Promise.all([
      fetch("/api/schedule/weeks"),
      fetch("/api/lessons/branches"),
      fetch("/api/schedule/templates"),
    ]);
    setWeeks(await wRes.json());
    setBranches(await bRes.json());
    setTemplates(await tRes.json());
  }

  useEffect(() => { load(); }, []);

  async function createWeek() {
    if (!branchId || !weekStart) return;
    setCreating(true);
    await fetch("/api/schedule/weeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId, weekStart, templateId: templateId || undefined }),
    });
    setCreating(false);
    setTemplateId("");
    load();
  }

  async function publishWeek(id: string) {
    await fetch(`/api/schedule/weeks/${id}/publish`, { method: "POST" });
    load();
  }

  async function copyWeek(id: string) {
    const target = prompt("تاريخ بداية الأسبوع الجديد (YYYY-MM-DD):");
    if (!target) return;
    await fetch(`/api/schedule/weeks/${id}/copy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetWeekStart: target }),
    });
    load();
  }

  const statusColors: Record<string, string> = {
    DRAFT: "bg-amber-900/20 text-amber-400 border-amber-900/30",
    PUBLISHED: "bg-green-900/20 text-green-400 border-green-900/30",
    ARCHIVED: "bg-gray-900/20 text-gray-400 border-gray-900/30",
  };

  return (
    <div dir="rtl">
        <div className="animate-scale-in mb-8 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="p-6">
            <h1 className="text-xl font-extrabold text-[#d4a843]">إدارة الجدول الأسبوعي</h1>
            <p className="text-sm text-[#94a3b8] mt-1">إنشاء ونشر جداول الحصص</p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        {/* Create week */}
        <div className="animate-fade-up mb-8 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-[#f1f5f9] mb-4">إنشاء أسبوع جديد</h2>
          <div className="flex flex-wrap gap-3">
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">اختر المستوى</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <input
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            />
            <select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">بدون قالب</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t._count.sessions} حصة)</option>
              ))}
            </select>
            <button
              onClick={createWeek}
              disabled={creating || !branchId || !weekStart}
              className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {creating ? "..." : "إنشاء"}
            </button>
          </div>
        </div>

        {/* Weeks list */}
        <div className="space-y-3">
          {weeks.map((w) => (
            <div
              key={w.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-sm font-medium text-[#f1f5f9]">
                      {w.branch.name}
                    </span>
                    <span className="mr-2 text-xs text-[#64748b]">
                      {new Date(w.weekStart).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <span className={`rounded border px-2 py-0.5 text-[9px] font-bold tracking-wider ${statusColors[w.status] || ""}`}>
                    {w.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#64748b]">{w._count.sessions} حصة</span>
                  <button
                    onClick={() => router.push(`/admin/schedule/weeks/${w.id}`)}
                    className="rounded-lg bg-[#334155]/50 px-2.5 py-1 text-xs text-[#94a3b8] hover:bg-[#334155] transition-colors"
                  >
                    تعديل
                  </button>
                  {w.status === "DRAFT" && (
                    <button
                      onClick={() => publishWeek(w.id)}
                      className="rounded-lg bg-[#22c55e]/20 px-2.5 py-1 text-xs text-[#22c55e] hover:bg-[#22c55e]/30 transition-colors"
                    >
                      نشر
                    </button>
                  )}
                  <button
                    onClick={() => copyWeek(w.id)}
                    className="rounded-lg bg-[#2563eb]/20 px-2.5 py-1 text-xs text-[#2563eb] hover:bg-[#2563eb]/30 transition-colors"
                  >
                    نسخ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • GESTION DES SÉANCES
        </div>
      </div>
  );
}
