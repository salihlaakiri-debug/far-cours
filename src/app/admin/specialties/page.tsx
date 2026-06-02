"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Specialty {
  id: string;
  name: string;
  slug: string;
  order: number;
}

export default function AdminSpecialtiesPage() {
  const { toast } = useToast();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/lessons/specialties");
    setSpecialties(await res.json());
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setName("");
    setSlug("");
    setEditingId(null);
  }

  function startEdit(s: Specialty) {
    setEditingId(s.id);
    setName(s.name);
    setSlug(s.slug);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingId) {
        const res = await fetch(`/api/lessons/specialties?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug }),
        });
        if (!res.ok) throw new Error("فشل تحديث التخصص");
        toast("success", `تم تحديث التخصص "${name}"`);
      } else {
        const order = specialties.length;
        const res = await fetch("/api/lessons/specialties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, slug, order }),
        });
        if (!res.ok) throw new Error("فشل إضافة التخصص");
        toast("success", `تم إضافة التخصص "${name}"`);
      }
      resetForm();
      load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ");
    }

    setLoading(false);
  }

  async function handleDelete(id: string) {
    setConfirmDelete(id);
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9]">إدارة التخصصات</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">{specialties.length} تخصص</p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
          <input
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="min-w-[200px] flex-1 rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
          />
          <input
            placeholder="المعرف (slug)"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="min-w-[140px] flex-1 rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#2563eb] px-5 py-2 text-sm text-white hover:bg-[#1d4ed8] disabled:opacity-50 transition-colors"
            >
              {loading ? "..." : editingId ? "تحديث" : "إضافة"}
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

      {/* Specialties Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {specialties.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 transition-all hover:border-[#334155]/70"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#d4a843]/10">
              <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM8.25 6a.75.75 0 100-1.5.75.75 0 000 1.5z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#f1f5f9]">{s.name}</h3>
            <p className="mt-0.5 text-xs text-[#64748b]">{s.slug}</p>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => startEdit(s)}
                className="rounded-lg px-3 py-1 text-xs font-medium text-[#2563eb] hover:bg-[#2563eb]/10 transition-colors"
              >
                تعديل
              </button>
              <button
                onClick={() => handleDelete(s.id)}
                className="rounded-lg px-3 py-1 text-xs font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        ))}
        {specialties.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[#64748b]">لا توجد تخصصات</p>
        )}
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف التخصص"
        message="هل أنت متأكد من حذف هذا التخصص؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/lessons/specialties?id=${confirmDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف التخصص");
            toast("success", "تم حذف التخصص");
            setConfirmDelete(null);
            load();
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
