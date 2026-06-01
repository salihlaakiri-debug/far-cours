"use client";

import { useState, useEffect } from "react";

interface SpecialtyMini {
  id: string;
  name: string;
  slug: string;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
  specialtyId: string;
  specialty?: SpecialtyMini;
}

export default function AdminBranchesPage() {
  const [specialties, setSpecialties] = useState<SpecialtyMini[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [specialtyId, setSpecialtyId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadSpecialties() {
    const res = await fetch("/api/lessons/specialties");
    setSpecialties(await res.json());
  }

  async function loadBranches() {
    const res = await fetch("/api/lessons/branches");
    setBranches(await res.json());
  }

  useEffect(() => { loadSpecialties(); loadBranches(); }, []);

  function resetForm() {
    setName("");
    setSlug("");
    setSpecialtyId("");
    setEditingId(null);
  }

  function startEdit(b: Branch) {
    setEditingId(b.id);
    setName(b.name);
    setSlug(b.slug);
    setSpecialtyId(b.specialtyId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/lessons/branches?id=${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialtyId, name, slug }),
      });
    } else {
      await fetch("/api/lessons/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialtyId, name, slug }),
      });
    }
    resetForm();
    loadBranches();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/lessons/branches?id=${id}`, { method: "DELETE" });
    loadBranches();
  }

  const filtered = branches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const countPerSpecialty = branches.reduce((acc: Record<string, number>, b) => {
    const key = b.specialty?.name || b.specialtyId;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">إدارة الأقسام الأكاديمية</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{branches.length} قسم في {specialties.length} تخصص</p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <select
            value={specialtyId}
            onChange={(e) => setSpecialtyId(e.target.value)}
            required
            className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
          >
            <option value="">اختر التخصص</option>
            {specialties.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({countPerSpecialty[s.name] || 0})</option>
            ))}
          </select>
          <input
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="min-w-[160px] flex-1 rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
          />
          <input
            placeholder="المعرف (slug)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="min-w-[120px] flex-1 rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-xl bg-[#2563eb] px-5 py-2 text-sm text-white hover:bg-[#1d4ed8] transition-colors"
            >
              {editingId ? "تحديث" : "إضافة"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#334155] bg-transparent px-4 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                إلغاء
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="بحث في الأقسام..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 py-2 pr-10 pl-3 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
        />
      </div>

      {/* Branches List */}
      <div className="space-y-2">
        {filtered.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 transition-all hover:border-[#334155]/70"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2563eb]/10 text-[#2563eb]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div>
                <span className="font-medium text-[#f1f5f9]">{b.name}</span>
                <span className="mr-2 text-xs text-[#94a3b8]">
                  {b.specialty?.name || b.specialtyId}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => startEdit(b)}
                className="rounded-lg px-3 py-1 text-xs text-[#2563eb] hover:bg-[#2563eb]/10 transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                className="rounded-lg px-3 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-[#64748b]">لا توجد أقسام</p>
        )}
      </div>
    </div>
  );
}
