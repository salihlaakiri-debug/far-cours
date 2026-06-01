import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/");

  const [branchCount, lessonCount, userCount, instructorCount, activePeriod, publishedWeeks] = await Promise.all([
    prisma.branch.count(),
    prisma.lesson.count(),
    prisma.user.count(),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.academicPeriod.findFirst({ where: { isActive: true } }),
    prisma.weeklySchedule.count({ where: { status: "PUBLISHED" } }),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, rank: true, militaryId: true, role: true, createdAt: true },
  });

  const stats = [
    { label: "الأقسام", value: branchCount, color: "text-[#2563eb]", bg: "bg-[#2563eb]/10", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" },
    { label: "المواد", value: lessonCount, color: "text-[#d4a843]", bg: "bg-[#d4a843]/10", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" },
    { label: "المستخدمين", value: userCount, color: "text-[#22c55e]", bg: "bg-[#22c55e]/10", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" },
    { label: "المدرسين", value: instructorCount, color: "text-[#a855f7]", bg: "bg-[#a855f7]/10", icon: "M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" },
    { label: "الجداول المنشورة", value: publishedWeeks, color: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
  ];

  return (
    <div>
      {/* Stats grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className="animate-fade-up rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-xl ${stat.bg} p-2`}>
                <svg className={`h-4 w-4 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                </svg>
              </div>
            </div>
            <div className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-[#64748b] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Active period */}
      {activePeriod && (
        <div className="animate-fade-up mb-8 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#334155]/40">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
              <span className="text-sm font-bold text-[#f1f5f9]">{activePeriod.name}</span>
            </div>
            <span className="text-[10px] text-[#64748b] tracking-wider">
              {activePeriod.startDate.toLocaleDateString("fr-FR")} — {activePeriod.endDate.toLocaleDateString("fr-FR")}
            </span>
          </div>
        </div>
      )}

      {/* Quick actions grid */}
      <h2 className="mb-4 text-sm font-bold text-[#94a3b8] tracking-wider">الإجراءات السريعة</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { href: "/admin/specialties", label: "إدارة التخصصات", desc: "إضافة وتعديل التخصصات الأكاديمية", icon: "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3zM8.25 6a.75.75 0 100-1.5.75.75 0 000 1.5z", color: "text-[#2563eb]" },
          { href: "/admin/branches", label: "إدارة الأقسام", desc: "إضافة وتعديل الأقسام السنوية", icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z", color: "text-[#d4a843]" },
          { href: "/admin/lessons", label: "إدارة المواد", desc: "رفع وتنظيم المواد الدراسية PDF", icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25", color: "text-[#22c55e]" },
          { href: "/admin/users", label: "إدارة المستخدمين", desc: "إضافة وتعديل المستخدمين والأدوار", icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z", color: "text-[#a855f7]" },
          { href: "/admin/schedule", label: "الجدول الأسبوعي", desc: "إنشاء ونشر جداول الحصص", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "text-[#06b6d4]" },
          { href: "/admin/periods", label: "الفترات الأكاديمية", desc: "إدارة الدورات والفترات الدراسية", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5", color: "text-[#d4a843]" },
        ].map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="animate-fade-up group relative overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-4 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:border-[#d4a843]/30 hover:shadow-xl hover:shadow-[#d4a843]/5 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-l from-[#d4a843]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a]/80 ring-1 ring-[#334155]/30 ${item.color}`}>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f1f5f9] transition-colors group-hover:text-[#d4a843]">{item.label}</h3>
                <p className="text-[10px] text-[#64748b] mt-0.5">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <h2 className="mt-8 mb-4 text-sm font-bold text-[#94a3b8] tracking-wider">آخر المستخدمين</h2>
      <div className="animate-fade-up overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
        <div className="divide-y divide-[#334155]/40">
          {recentUsers.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f172a]/80 text-xs font-bold text-[#2563eb] ring-1 ring-[#334155]/30">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#f1f5f9]">{u.name}</div>
                  <div className="text-[10px] text-[#64748b]">{u.rank} · {u.militaryId}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-[9px] font-bold tracking-wider ${
                  u.role === "ADMIN" ? "bg-[#d4a843]/10 text-[#d4a843]" :
                  u.role === "INSTRUCTOR" ? "bg-[#2563eb]/10 text-[#2563eb]" :
                  "bg-[#334155]/50 text-[#64748b]"
                }`}>
                  {u.role}
                </span>
                <span className="text-[10px] text-[#64748b]">{u.createdAt.toLocaleDateString("fr-FR")}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
