"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";

interface UserData {
  id: string;
  name: string;
  rank: string;
  militaryId: string;
  role: "USER" | "INSTRUCTOR" | "ADMIN";
  active: boolean;
  lastLogin: string | null;
  academicYear: string | null;
}

interface FormData {
  name: string;
  rank: string;
  militaryId: string;
  password: string;
  role: "USER" | "INSTRUCTOR" | "ADMIN";
  academicYear: string;
}

const emptyForm: FormData = {
  name: "",
  rank: "",
  militaryId: "",
  password: "",
  role: "USER",
  academicYear: "",
};

const roleConfig: Record<string, { label: string; class: string }> = {
  ADMIN: {
    label: "مدير",
    class: "bg-[#d4a843]/20 text-[#d4a843] border border-[#d4a843]/30",
  },
  INSTRUCTOR: {
    label: "مدرس",
    class: "bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30",
  },
  USER: {
    label: "مستخدم",
    class: "bg-[#64748b]/20 text-[#94a3b8] border border-[#64748b]/30",
  },
};

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("فشل تحميل المستخدمين");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تحميل المستخدمين");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.militaryId.toLowerCase().includes(q);
  });

  function openAddModal() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(user: UserData) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      rank: user.rank,
      militaryId: user.militaryId,
      password: "",
      role: user.role,
      academicYear: user.academicYear || "",
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.rank || !form.militaryId || (!editingId && !form.password)) return;
    setSaving(true);
    try {
      const body: Record<string, string> = { name: form.name, rank: form.rank, militaryId: form.militaryId, role: form.role };
      if (form.password) body.password = form.password;
      if (form.academicYear) body.academicYear = form.academicYear;

      let res: Response;
      if (editingId) {
        res = await fetch(`/api/users?id=${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || (editingId ? "فشل تحديث المستخدم" : "فشل إضافة المستخدم"));
      }
      setModalOpen(false);
      toast("success", editingId ? "تم تحديث المستخدم بنجاح" : "تم إضافة المستخدم بنجاح");
      loadUsers();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء حفظ المستخدم");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: UserData) {
    try {
      const res = await fetch(`/api/users?id=${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !user.active }),
      });
      if (!res.ok) throw new Error("فشل تحديث الحالة");
      toast("success", user.active ? "تم تعطيل المستخدم" : "تم تفعيل المستخدم");
      loadUsers();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء تحديث الحالة");
    }
  }

  async function handleDelete(id: string, name: string) {
    setConfirmDelete({ id, name });
  }

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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">إدارة المستخدمين</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">إدارة حسابات المستخدمين والصلاحيات</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 self-start rounded-xl bg-[#2563eb] px-4 py-2.5 text-sm text-white hover:bg-[#1d4ed8] transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          مستخدم جديد
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو الرقم العسكري..."
          className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-10 py-2.5 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b] hover:text-[#f1f5f9] transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Count */}
      {!loading && !error && filteredUsers.length > 0 && (
        <p className="mb-3 text-xs text-[#64748b]">
          {filteredUsers.length} من أصل {users.length} مستخدم
        </p>
      )}

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
            onClick={loadUsers}
            className="rounded-lg bg-[#ef4444]/20 px-3 py-1.5 text-xs text-[#ef4444] hover:bg-[#ef4444]/30 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-10 text-center">
          <svg className="mx-auto mb-4 h-16 w-16 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <p className="text-[#94a3b8]">{search ? "لا توجد نتائج للبحث" : "لا يوجد مستخدمين بعد"}</p>
          {!search && (
            <button
              onClick={openAddModal}
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              إضافة مستخدم جديد
            </button>
          )}
        </div>
      )}

      {/* User cards */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="space-y-3">
          {filteredUsers.map((user, i) => (
            <div
              key={user.id}
              className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 transition-all duration-200 hover:border-[#334155]/60"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-sm font-bold text-[#d4a843] ring-1 ring-[#d4a843]/20">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#f1f5f9]">{user.name}</span>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${roleConfig[user.role]?.class || ""}`}>
                        {roleConfig[user.role]?.label || user.role}
                      </span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-[#94a3b8]">
                      <span>{user.rank}</span>
                      <span className="text-[#64748b]">|</span>
                      <span dir="ltr">{user.militaryId}</span>
                      {user.academicYear && (
                        <>
                          <span className="text-[#64748b]">|</span>
                          <span className="text-[#d4a843]/70">{user.academicYear}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  {/* Last login */}
                  <div className="hidden text-[11px] text-[#64748b] sm:block">
                    <span className="text-[#94a3b8]">آخر دخول: </span>
                    {formatDate(user.lastLogin)}
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => handleToggleActive(user)}
                    title={user.active ? "تعطيل" : "تفعيل"}
                    className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                      user.active ? "bg-[#22c55e]/70 hover:bg-[#22c55e]" : "bg-[#475569] hover:bg-[#64748b]"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        user.active ? "translate-x-[18px]" : "translate-x-[2px]"
                      }`}
                    />
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(user)}
                    title="تعديل"
                    className="rounded-lg p-2 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#2563eb] transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(user.id, user.name)}
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

      {/* Modal */}
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
              <h2 className="text-lg font-bold text-[#f1f5f9]">
                {editingId ? "تعديل المستخدم" : "إضافة مستخدم جديد"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#f1f5f9] transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الاسم</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="الاسم الكامل"
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الرتبة</label>
                  <input
                    value={form.rank}
                    onChange={(e) => setForm({ ...form, rank: e.target.value })}
                    required
                    placeholder="مثال: ملازم"
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الرقم العسكري</label>
                  <input
                    value={form.militaryId}
                    onChange={(e) => setForm({ ...form, militaryId: e.target.value })}
                    required
                    placeholder="مثال: 12345"
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">
                    كلمة المرور
                    {editingId && (
                      <span className="mr-1 text-[#64748b]">(اتركه فارغًا للإبقاء)</span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required={!editingId}
                    placeholder={editingId ? "اتركه فارغًا" : "أدخل كلمة المرور"}
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">السنة الدراسية</label>
                  <select
                    value={form.academicYear}
                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none transition-colors"
                  >
                    <option value="">بدون</option>
                    <option value="2024-2025">2024-2025</option>
                    <option value="2025-2026">2025-2026</option>
                    <option value="2026-2027">2026-2027</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-[#94a3b8]">الصلاحية</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as FormData["role"] })}
                    className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none transition-colors"
                  >
                    <option value="USER">مستخدم</option>
                    <option value="INSTRUCTOR">مدرس</option>
                    <option value="ADMIN">مدير</option>
                  </select>
                </div>
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
                  ) : editingId ? (
                    "حفظ التغييرات"
                  ) : (
                    "إضافة المستخدم"
                  )}
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
        title="حذف المستخدم"
        message={`هل أنت متأكد من حذف المستخدم "${confirmDelete?.name}"؟ لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDelete) return;
          try {
            const res = await fetch(`/api/users?id=${confirmDelete.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف المستخدم");
            toast("success", `تم حذف المستخدم "${confirmDelete.name}"`);
            setConfirmDelete(null);
            loadUsers();
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
