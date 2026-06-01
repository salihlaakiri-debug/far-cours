"use client";

import { useState, useEffect } from "react";

interface Period {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminPeriodsPage() {
  const [periods, setPeriods] = useState<Period[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [editing, setEditing] = useState<Period | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/academic/periods");
    setPeriods(await res.json());
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setName("");
    setSlug("");
    setStartDate("");
    setEndDate("");
    setIsActive(false);
    setEditing(null);
  }

  function editPeriod(p: Period) {
    setEditing(p);
    setName(p.name);
    setSlug(p.slug);
    setStartDate(p.startDate?.slice(0, 10) || "");
    setEndDate(p.endDate?.slice(0, 10) || "");
    setIsActive(p.isActive);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body = { name, slug, startDate, endDate, isActive };

    if (editing) {
      await fetch(`/api/academic/periods?id=${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } else {
      await fetch("/api/academic/periods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    }

    setLoading(false);
    resetForm();
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد حذف هذه الفترة؟")) return;
    await fetch(`/api/academic/periods?id=${id}`, { method: "DELETE" });
    load();
  }

  async function handleSetActive(id: string) {
    await fetch(`/api/academic/periods?id=${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    load();
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8" dir="rtl">
        <div className="animate-scale-in mb-8 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="p-6">
            <h1 className="text-xl font-extrabold text-[#d4a843]">إدارة الفترات الأكاديمية</h1>
            <p className="text-sm text-[#94a3b8] mt-1">إنشاء وتعديل الفترات الدراسية</p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        <div className="animate-fade-up mb-8 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-[#f1f5f9] mb-4">
            {editing ? "تعديل الفترة" : "إضافة فترة جديدة"}
          </h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <input
              placeholder="الاسم"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="flex-1 min-w-[160px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
            />
            <input
              placeholder="المعرف (slug)"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="flex-1 min-w-[120px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            />
            <label className="flex items-center gap-2 text-sm text-[#f1f5f9]">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-[#334155] bg-[#0f172a]/80 text-[#2563eb] focus:ring-[#2563eb]"
              />
              نشطة
            </label>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
              >
                {loading ? "..." : editing ? "تحديث" : "إضافة"}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#334155] px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
                >
                  إلغاء
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {periods.map((p) => (
            <div
              key={p.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-[#f1f5f9]">{p.name}</h3>
                  <span className="text-[10px] text-[#64748b]">{p.slug}</span>
                </div>
                <span
                  className={`rounded border px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                    p.isActive
                      ? "border-green-900/30 bg-green-900/20 text-[#22c55e]"
                      : "border-gray-900/30 bg-gray-900/20 text-gray-400"
                  }`}
                >
                  {p.isActive ? "نشطة" : "غير نشطة"}
                </span>
              </div>
              <div className="space-y-1 mb-3 text-[11px] text-[#94a3b8]">
                <div className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {p.startDate ? new Date(p.startDate).toLocaleDateString("fr-FR") : "—"} {" -> "}
                  {p.endDate ? new Date(p.endDate).toLocaleDateString("fr-FR") : "—"}
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-[#334155]/40">
                <button
                  onClick={() => editPeriod(p)}
                  className="flex items-center gap-1 rounded-lg bg-[#2563eb]/20 px-2.5 py-1 text-xs text-[#2563eb] hover:bg-[#2563eb]/30 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                  تعديل
                </button>
                {!p.isActive && (
                  <button
                    onClick={() => handleSetActive(p.id)}
                    className="flex items-center gap-1 rounded-lg bg-[#22c55e]/20 px-2.5 py-1 text-xs text-[#22c55e] hover:bg-[#22c55e]/30 transition-colors"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    تفعيل
                  </button>
                )}
                <button
                  onClick={() => handleDelete(p.id)}
                  className="flex items-center gap-1 rounded-lg bg-[#ef4444]/20 px-2.5 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors mr-auto"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  حذف
                </button>
              </div>
            </div>
          ))}
          {periods.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#64748b] text-sm">
              لا توجد فترات أكاديمية بعد
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • GESTION DES PÉRIODES
        </div>
      </div>
    </div>
  );
}
