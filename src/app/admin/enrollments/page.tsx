"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface User {
  id: string;
  name: string;
  rank: string;
  militaryId: string;
  role: string;
}

interface Period {
  id: string;
  name: string;
  isActive: boolean;
}

interface Enrollment {
  id: string;
  userId: string;
  instructorId: string | null;
  academicPeriodId: string;
  enrolledAt: string;
  user: { id: string; name: string; rank: string; militaryId: string };
  instructor: { id: string; name: string; rank: string } | null;
  academicPeriod: { id: string; name: string };
}

export default function AdminEnrollmentsPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterPeriod, setFilterPeriod] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filterPeriod) params.set("periodId", filterPeriod);
      const res = await fetch(`/api/academic/enrollments?${params}`);
      if (!res.ok) throw new Error("فشل تحميل التسجيلات");
      const data = await res.json();
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [filterPeriod]);

  async function loadUsers() {
    const res = await fetch("/api/users");
    const data: User[] = await res.json();
    setUsers(Array.isArray(data) ? data : []);
  }

  async function loadInstructors() {
    const res = await fetch("/api/users?role=INSTRUCTOR");
    const data: User[] = await res.json();
    setInstructors(Array.isArray(data) ? data : []);
  }

  async function loadPeriods() {
    const res = await fetch("/api/academic/periods");
    const data: Period[] = await res.json();
    setPeriods(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadEnrollments();
    loadUsers();
    loadInstructors();
    loadPeriods();
  }, [loadEnrollments]);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  function openAddModal() {
    setSelectedUser("");
    setSelectedInstructor("");
    setSelectedPeriod("");
    setModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUser || !selectedPeriod) return;
    setSaving(true);
    try {
      const res = await fetch("/api/academic/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser,
          instructorId: selectedInstructor || undefined,
          academicPeriodId: selectedPeriod,
        }),
      });
      if (!res.ok) throw new Error("فشل إنشاء التسجيل");
      setModalOpen(false);
      toast("success", "تم إنشاء التسجيل بنجاح");
      loadEnrollments();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء إنشاء التسجيل");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, userName: string) {
    setConfirmDelete({ id, name: userName });
  }

  function formatDate(dateStr: string) {
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">إدارة التسجيلات</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">تسجيل المستخدمين في الفترات الأكاديمية</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 self-start rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          تسجيل جديد
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4">
        <svg className="h-4 w-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
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
        {filterPeriod && (
          <button
            onClick={() => setFilterPeriod("")}
            className="rounded-lg border border-[#334155] px-3 py-1.5 text-xs text-[#94a3b8] hover:text-[#f1f5f9] transition-colors"
          >
            إلغاء التصفية
          </button>
        )}
        <span className="mr-auto text-xs text-[#64748b]">{enrollments.length} تسجيل</span>
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
            onClick={loadEnrollments}
            className="rounded-lg bg-[#ef4444]/20 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && enrollments.length === 0 && (
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-10 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0zm-18 0a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
          </svg>
          <p className="text-[#94a3b8]">لا توجد تسجيلات بعد</p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            إضافة تسجيل جديد
          </button>
        </div>
      )}

      {/* Enrollments list */}
      {!loading && !error && enrollments.length > 0 && (
        <div className="space-y-3">
          {enrollments.map((enr, i) => (
            <div
              key={enr.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 transition-all duration-200 hover:border-[#334155]/60"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-sm font-bold text-[#d4a843] ring-1 ring-[#d4a843]/20">
                    {enr.user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#f1f5f9]">{enr.user.name}</span>
                      <span className="rounded-md bg-[#64748b]/20 px-2 py-0.5 text-[10px] font-medium text-[#94a3b8] border border-[#64748b]/30">
                        {enr.user.rank}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[#94a3b8]">
                      <span dir="ltr">{enr.user.militaryId}</span>
                      <span className="text-[#64748b]">|</span>
                      <svg className="h-3.5 w-3.5 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      {enr.academicPeriod.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {enr.instructor && (
                    <div className="flex items-center gap-1.5 rounded-lg bg-[#2563eb]/10 px-2.5 py-1 text-[11px] text-[#2563eb]">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {enr.instructor.rank} {enr.instructor.name}
                    </div>
                  )}
                  <div className="text-[11px] text-[#64748b]">
                    <span className="text-[#94a3b8]">تاريخ التسجيل: </span>
                    {formatDate(enr.enrolledAt)}
                  </div>
                  <button
                    onClick={() => handleDelete(enr.id, enr.user.name)}
                    title="حذف"
                    className="rounded-lg p-2 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#ef4444] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
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
              <h2 className="text-lg font-bold text-[#f1f5f9]">تسجيل جديد</h2>
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
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">المستخدم</label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">اختر المستخدم</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.rank} {u.name} ({u.militaryId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">المدرس (اختياري)</label>
                <select
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">بدون مدرس</option>
                  {instructors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.rank} {u.name} ({u.militaryId})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الفترة الأكاديمية</label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
                >
                  <option value="">اختر الفترة</option>
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.isActive ? "✓" : ""}
                    </option>
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
                  ) : "إضافة التسجيل"}
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
        title="حذف التسجيل"
        message={`هل أنت متأكد من حذف تسجيل "${confirmDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/academic/enrollments?id=${confirmDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف التسجيل");
            toast("success", `تم حذف تسجيل "${confirmDelete.name}"`);
            setConfirmDelete(null);
            loadEnrollments();
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
