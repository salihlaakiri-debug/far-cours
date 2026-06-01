"use client";

import { useState, useEffect } from "react";

interface BranchMini {
  id: string;
  name: string;
  specialty?: { name: string };
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  branchId: string;
  academicYear: string | null;
  branch?: { name: string };
  pdfSize: number | null;
  order: number;
  createdAt: string | null;
}

export default function AdminLessonsPage() {
  const [branches, setBranches] = useState<BranchMini[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [branchId, setBranchId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  async function loadBranches() {
    const res = await fetch("/api/lessons/branches");
    setBranches(await res.json());
  }

  async function loadLessons() {
    const res = await fetch("/api/lessons");
    setLessons(await res.json());
  }

  useEffect(() => { loadBranches(); loadLessons(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("branchId", branchId);
    formData.append("title", title);
    formData.append("academicYear", academicYear);
    if (description) formData.append("description", description);

    await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    setTitle("");
    setDescription("");
    setAcademicYear("");
    setFile(null);
    setUploading(false);
    loadLessons();
  }

  async function handleDelete(id: string) {
    if (!confirm("تأكيد الحذف؟")) return;
    await fetch(`/api/lessons?id=${id}`, { method: "DELETE" });
    loadLessons();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatSize(bytes: number | null | undefined) {
    if (!bytes) return "—";
    const mb = bytes / 1024 / 1024;
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  }

  const filtered = lessons.filter((l) =>
    l.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">إدارة المواد</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{lessons.length} مادة مرفوعة</p>
      </div>

      {/* Upload Form Card */}
      <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5">
        <h2 className="mb-4 text-sm font-semibold text-[#d4a843]">رفع مادة جديدة</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
            className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
          >
            <option value="">اختر القسم</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.specialty?.name || ""})
              </option>
            ))}
          </select>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            required
            className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
          >
            <option value="">اختر السنة الدراسية</option>
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
          <input
            placeholder="عنوان المادة"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
          />
          <textarea
            placeholder="الوصف (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
            rows={2}
          />
          <div className="rounded-xl border border-dashed border-[#334155] bg-[#0f172a]/50 p-4 text-center">
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              className="w-full text-sm text-[#94a3b8] file:mr-2 file:rounded-lg file:border-0 file:bg-[#2563eb] file:px-4 file:py-1.5 file:text-sm file:text-white file:hover:bg-[#1d4ed8] file:transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="w-full rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
          >
            {uploading ? "جاري الرفع..." : "رفع المادة"}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          placeholder="بحث في المواد..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 py-2 pr-10 pl-3 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
        />
      </div>

      {/* Lessons Table */}
      <div className="overflow-hidden rounded-2xl border border-[#334155]/40">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-[#334155]/40 bg-[#1e293b]/60">
              <th className="px-4 py-3 font-medium text-[#94a3b8]">العنوان</th>
              <th className="px-4 py-3 font-medium text-[#94a3b8]">القسم</th>
              <th className="px-4 py-3 font-medium text-[#94a3b8]">السنة</th>
              <th className="px-4 py-3 font-medium text-[#94a3b8]">الحجم</th>
              <th className="px-4 py-3 font-medium text-[#94a3b8]">تاريخ الرفع</th>
              <th className="px-4 py-3 font-medium text-[#94a3b8]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]/20">
            {filtered.map((l) => (
              <tr
                key={l.id}
                className="bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 transition-colors hover:bg-[#1e293b]"
              >
                <td className="px-4 py-3">
                  <div>
                    <span className="font-medium text-[#f1f5f9]">{l.title}</span>
                    {l.description && (
                      <p className="mt-0.5 text-xs text-[#64748b] line-clamp-1">{l.description}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-[#94a3b8]">{l.branch?.name || "—"}</td>
                <td className="px-4 py-3 text-[#94a3b8]">{l.academicYear || "—"}</td>
                <td className="px-4 py-3 text-[#94a3b8]">{formatSize(l.pdfSize)}</td>
                <td className="px-4 py-3 text-[#94a3b8]">{l.createdAt ? formatDate(l.createdAt) : "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="rounded-lg px-3 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-[#64748b]">
                  لا توجد مواد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
