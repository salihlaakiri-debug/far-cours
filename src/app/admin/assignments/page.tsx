"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface User {
  id: string;
  name: string;
  rank: string;
  militaryId: string;
  role: string;
}

interface Branch {
  id: string;
  name: string;
  specialty?: { name: string };
}

interface Period {
  id: string;
  name: string;
  isActive: boolean;
}

interface Assignment {
  id: string;
  instructor: { id: string; name: string; rank: string; militaryId: string };
  branch: { id: string; name: string };
  academicPeriod: { id: string; name: string };
}

export default function AdminAssignmentsPage() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [instructorId, setInstructorId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [academicPeriodId, setAcademicPeriodId] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function loadAssignments() {
    const res = await fetch("/api/academic/assignments");
    setAssignments(await res.json());
  }

  async function loadInstructors() {
    const res = await fetch("/api/users");
    const users: User[] = await res.json();
    setInstructors(users.filter((u) => u.role === "INSTRUCTOR"));
  }

  async function loadBranches() {
    const res = await fetch("/api/lessons/branches");
    setBranches(await res.json());
  }

  async function loadPeriods() {
    const res = await fetch("/api/academic/periods");
    setPeriods(await res.json());
  }

  useEffect(() => {
    loadAssignments();
    loadInstructors();
    loadBranches();
    loadPeriods();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!instructorId || !branchId || !academicPeriodId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/academic/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructorId, branchId, academicPeriodId }),
      });
      if (!res.ok) throw new Error("فشل إضافة التوزيع");
      toast("success", "تم إضافة التوزيع بنجاح");
      setInstructorId("");
      setBranchId("");
      setAcademicPeriodId("");
      loadAssignments();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ");
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    setConfirmDelete(id);
  }

  const filtered = assignments.filter((a) => {
    if (filterInstructor && a.instructor.id !== filterInstructor) return false;
    if (filterPeriod && a.academicPeriod.id !== filterPeriod) return false;
    return true;
  });

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a] pointer-events-none" />
      <div className="relative mx-auto max-w-5xl">
        <div className="animate-scale-in mb-8 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="p-6">
            <h1 className="text-xl font-extrabold text-[#d4a843]">توزيع المدرسين</h1>
            <p className="text-sm text-[#94a3b8] mt-1">إسناد المدرسين إلى الأقسام حسب الفترة الأكاديمية</p>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        <div className="animate-fade-up mb-8 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
          <h2 className="text-sm font-bold text-[#f1f5f9] mb-4">توزيع جديد</h2>
          <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
            <select
              value={instructorId}
              onChange={(e) => setInstructorId(e.target.value)}
              required
              className="flex-1 min-w-[160px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">اختر المدرس</option>
              {instructors.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.rank} {u.name} ({u.militaryId})
                </option>
              ))}
            </select>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              required
              className="flex-1 min-w-[140px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">اختر القسم</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}{b.specialty ? ` (${b.specialty.name})` : ""}
                </option>
              ))}
            </select>
            <select
              value={academicPeriodId}
              onChange={(e) => setAcademicPeriodId(e.target.value)}
              required
              className="flex-1 min-w-[140px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">اختر الفترة</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.isActive ? "✓" : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "إضافة"}
            </button>
          </form>
        </div>

        <div className="animate-fade-up mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterInstructor}
              onChange={(e) => setFilterInstructor(e.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">جميع المدرسين</option>
              {instructors.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.rank} {u.name}
                </option>
              ))}
            </select>
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
            >
              <option value="">جميع الفترات</option>
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {(filterInstructor || filterPeriod) && (
              <button
                onClick={() => { setFilterInstructor(""); setFilterPeriod(""); }}
                className="rounded-xl border border-[#334155] px-3 py-2 text-sm text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
              >
                إلغاء التصفية
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <div
              key={a.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb]/15 text-[#2563eb]">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#f1f5f9]">{a.instructor.rank} {a.instructor.name}</h3>
                    <span className="text-[10px] text-[#64748b]">{a.instructor.militaryId}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5 mb-3 text-[11px] text-[#94a3b8]">
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                  {a.branch.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <svg className="h-3.5 w-3.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {a.academicPeriod.name}
                </div>
              </div>
              <div className="flex items-center pt-2 border-t border-[#334155]/40">
                <button
                  onClick={() => handleDelete(a.id)}
                  className="flex items-center gap-1 rounded-lg bg-[#ef4444]/20 px-2.5 py-1 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                  حذف
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-[#64748b] text-sm">
              لا توجد توزيعات
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • GESTION DES AFFECTATIONS
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="حذف التوزيع"
        message="هل أنت متأكد من حذف هذا التوزيع؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/academic/assignments?id=${confirmDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف التوزيع");
            toast("success", "تم حذف التوزيع");
            setConfirmDelete(null);
            loadAssignments();
          } catch (err) {
            toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
            setConfirmDelete(null);
          }
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
