"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type UserType = "ADMIN" | "INSTRUCTOR" | "STUDENT_Y1" | "STUDENT_Y2" | "ISTA" | null;

const TYPE_ACADEMIC_YEAR: Record<string, string> = {
  STUDENT_Y1: "2024-2025",
  STUDENT_Y2: "2025-2026",
  ISTA: "ISTA",
};

const CARDS: { value: UserType; label: string; icon: string }[] = [
  { value: "ADMIN", label: "مدير النظام", icon: "ti-shield" },
  { value: "INSTRUCTOR", label: "ملقن / أستاذ", icon: "ti-chalkboard" },
  { value: "STUDENT_Y1", label: "تلميذ — السنة الأولى", icon: "ti-user" },
  { value: "STUDENT_Y2", label: "تلميذ — السنة الثانية", icon: "ti-user-check" },
  { value: "ISTA", label: "تكوين ISTA", icon: "ti-school" },
];

const SVG_ICONS: Record<string, React.ReactNode> = {
  "ti-shield": (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3L3 7v5c0 5.5 4.5 10 9 10s9-4.5 9-10V7l-9-4z" />
    </svg>
  ),
  "ti-chalkboard": (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  ),
  "ti-user": (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  "ti-user-check": (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <polyline points="17 11 19 13 23 9" />
    </svg>
  ),
  "ti-school": (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10L12 5L2 10l10 5l10-5z" />
      <path d="M6 12v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5" />
    </svg>
  ),
};

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  const derivedAcademicYear = userType ? TYPE_ACADEMIC_YEAR[userType] ?? null : null;
  const showAcademicYear = userType === "STUDENT_Y1" || userType === "STUDENT_Y2" || userType === "ISTA";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userType) { setError("اختر نوع المستخدم أولاً"); return; }
    setError("");
    setLoading(true);

    setError("");

    try {
      const form = new FormData(e.currentTarget);
      const result = await signIn("credentials", {
        name: form.get("name"),
        matricule: form.get("matricule"),
        userType,
        redirect: false,
      });

      if (result?.error) {
        setError("الاسم أو الرقم غير صحيح");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#2563eb] blur-[128px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#d4a843] blur-[128px]" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-2 shadow-xl shadow-black/30 ring-1 ring-[#d4a843]/20">
            <img src="/ERB.png" alt="ERB" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#d4a843]">سلاح المدرعات</h1>
          <p className="mt-2 text-sm text-[#94a3b8]">منصة التكوين الأكاديمي</p>
          <p className="text-xs text-[#64748b]">القوات المسلحة الملكية المغربية</p>
        </div>

        <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-red-800/50 bg-red-900/20 p-3 text-sm text-red-400">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#94a3b8] mb-3 text-right">نوع المستخدم</label>
              <div className="grid grid-cols-2 gap-2" dir="rtl">
                {CARDS.map((card) => {
                  const selected = userType === card.value;
                  return (
                    <button
                      key={card.value}
                      type="button"
                      onClick={() => setUserType(card.value)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                        selected
                          ? "border-[#d4a843] bg-[#d4a843]/10 text-[#d4a843]"
                          : "border-[#334155] bg-[#0f172a]/60 text-[#94a3b8] hover:border-[#334155]/80 hover:text-[#f1f5f9]"
                      }`}
                    >
                      <span className={selected ? "text-[#d4a843]" : "text-[#64748b]"}>{SVG_ICONS[card.icon]}</span>
                      <span className="text-[10px] font-medium leading-tight">{card.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#94a3b8] mb-1.5 text-right">الاسم الكامل</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] transition-all focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                placeholder="أدخل اسمك الكامل"
              />
            </div>

            <div style={{ display: showAcademicYear ? undefined : "none" }}>
              <label htmlFor="academicYear" className="block text-sm font-medium text-[#94a3b8] mb-1.5 text-right">السنة الدراسية</label>
              <input
                id="academicYear"
                name="academicYear"
                type="text"
                value={derivedAcademicYear ?? ""}
                readOnly
                className="block w-full rounded-xl border border-[#334155] bg-[#1e293b]/40 px-4 py-3 text-sm text-[#94a3b8] cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-[#94a3b8] mb-1.5 text-right">المعرّف الرقمي (MATRICULE)</label>
              <input
                id="matricule"
                name="matricule"
                type="text"
                required
                className="block w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-4 py-3 text-sm text-[#f1f5f9] placeholder-[#64748b] transition-all focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
                placeholder="أدخل رقمك العسكري"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-l from-[#2563eb] to-[#1d4ed8] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#2563eb]/25 transition-all hover:shadow-xl hover:shadow-[#2563eb]/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] text-[#64748b] tracking-wider">ROYAUME DU MAROC • FORCES ARMÉES ROYALES</p>
      </div>
    </div>
  );
}
