"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Branch {
  id: string;
  name: string;
}

interface Template {
  id: string;
  name: string;
  description: string | null;
  branchId: string;
  createdAt: string;
  _count: { sessions: number };
  branch: { name: string };
}

export default function AdminTemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  async function loadTemplates() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/schedule/templates");
      if (!res.ok) throw new Error("فشل تحميل القوالب");
      const data = await res.json();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function loadBranches() {
    const res = await fetch("/api/lessons/branches");
    const data: Branch[] = await res.json();
    setBranches(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadTemplates();
    loadBranches();
  }, []);

  function openAddModal() {
    setName("");
    setDescription("");
    setBranchId("");
    setModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !branchId) return;
    setSaving(true);
    try {
      const res = await fetch("/api/schedule/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined, branchId }),
      });
      if (!res.ok) throw new Error("فشل إنشاء القالب");
      setModalOpen(false);
      toast("success", `تم إنشاء القالب "${name}"`);
      loadTemplates();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    setConfirmDelete({ id, name });
  }

  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">قوالب الجدول</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">إنشاء وإدارة قوالب الجداول الأسبوعية</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 self-start rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          قالب جديد
        </button>
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
            onClick={loadTemplates}
            className="rounded-lg bg-[#ef4444]/20 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && templates.length === 0 && (
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-10 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="text-[#94a3b8]">لا توجد قوالب بعد</p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إنشاء قالب جديد
          </button>
        </div>
      )}

      {/* Templates grid */}
      {!loading && !error && templates.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => (
            <div
              key={t.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 transition-all duration-200 hover:border-[#d4a843]/30 hover:shadow-xl hover:shadow-[#d4a843]/5"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link href={`/admin/templates/${t.id}`} className="block">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4a843]/10 text-[#d4a843]">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <span className="rounded-md bg-[#2563eb]/10 px-2 py-0.5 text-[10px] font-medium text-[#2563eb] border border-[#2563eb]/20">
                    {t._count.sessions} جلسة
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#f1f5f9] mb-1">{t.name}</h3>
                {t.description && (
                  <p className="text-xs text-[#94a3b8] line-clamp-2 mb-2">{t.description}</p>
                )}
                <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
                  <svg className="h-3.5 w-3.5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  {t.branch.name}
                </div>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#64748b]">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDate(t.createdAt)}
                </div>
              </Link>
              <div className="mt-3 pt-3 border-t border-[#334155]/40 flex items-center justify-between">
                <Link
                  href={`/admin/templates/${t.id}`}
                  className="flex items-center gap-1 rounded-lg bg-[#2563eb]/10 px-2.5 py-1 text-xs text-[#2563eb] hover:bg-[#2563eb]/20 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  عرض الجلسات
                </Link>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#ef4444] transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg animate-scale-in rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#f1f5f9]">قالب جديد</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#f1f5f9] transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">اسم القالب</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="مثال: قالب الفترة الأولى"
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الوصف (اختياري)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="وصف القالب..."
                  rows={2}
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">القسم</label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">اختر القسم</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الحفظ...
                    </span>
                  ) : "إنشاء القالب"}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-xl border border-[#334155] px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#334155]/30 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف القالب"
        message={`هل أنت متأكد من حذف القالب "${confirmDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/schedule/templates?id=${confirmDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف القالب");
            toast("success", `تم حذف القالب "${confirmDelete.name}"`);
            setConfirmDelete(null);
            loadTemplates();
          } catch (err) {
            toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
