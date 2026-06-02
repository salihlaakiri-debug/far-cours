"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import { DataTable, type Column } from "@/components/ui/DataTable";

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
  const { toast } = useToast();
  const [branches, setBranches] = useState<BranchMini[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [branchId, setBranchId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; title: string } | null>(null);

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

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "فشل رفع المادة" }));
      toast("error", err.error || "فشل رفع المادة");
      setUploading(false);
      return;
    }

    toast("success", `تم رفع "${title}" بنجاح`);
    setTitle("");
    setDescription("");
    setAcademicYear("");
    setFile(null);
    setUploading(false);
    loadLessons();
  }

  async function handleDelete(id: string, lessonTitle: string) {
    setConfirmDelete({ id, title: lessonTitle });
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

  const columns: Column<Lesson>[] = [
    {
      key: "title",
      label: "العنوان",
      sortable: true,
      render: (l) => (
        <div>
          <span className="font-medium text-[#f1f5f9]">{l.title}</span>
          {l.description && (
            <p className="mt-0.5 text-xs text-[#64748b] line-clamp-1">{l.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "branchId",
      label: "القسم",
      sortable: true,
      render: (l) => <span className="text-[#94a3b8]">{l.branch?.name || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "academicYear",
      label: "السنة",
      sortable: true,
      render: (l) => <span className="text-[#94a3b8]">{l.academicYear || "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "pdfSize",
      label: "الحجم",
      sortable: true,
      render: (l) => <span className="text-[#94a3b8]">{formatSize(l.pdfSize)}</span>,
      hideOnMobile: true,
    },
    {
      key: "createdAt",
      label: "تاريخ الرفع",
      sortable: true,
      render: (l) => <span className="text-[#94a3b8]">{l.createdAt ? formatDate(l.createdAt) : "—"}</span>,
      hideOnMobile: true,
    },
    {
      key: "actions",
      label: "",
      render: (l) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleDelete(l.id, l.title); }}
          className="rounded-lg px-3 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
        >
          حذف
        </button>
      ),
    },
  ];

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

      {/* Lessons Table */}
      <DataTable<Lesson>
        columns={columns}
        data={lessons}
        keyExtractor={(l) => l.id}
        searchable
        searchPlaceholder="بحث في المواد..."
        emptyTitle="لا توجد مواد"
        emptyAction={
          <span className="text-xs text-[#64748b]">ارفع أول مادة من النموذج أعلاه</span>
        }
      />

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف المادة"
        message={`هل أنت متأكد من حذف "${confirmDelete?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/lessons?id=${confirmDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف المادة");
            toast("success", `تم حذف "${confirmDelete.title}"`);
            setConfirmDelete(null);
            loadLessons();
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
