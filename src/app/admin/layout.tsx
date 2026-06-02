"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { NotificationBell } from "@/components/NotificationBell";
import Image from "next/image";

const navItems = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/specialties", label: "التخصصات" },
  { href: "/admin/branches", label: "الأقسام" },
  { href: "/admin/lessons", label: "المواد" },
  { href: "/admin/users", label: "المستخدمين" },
  { href: "/admin/periods", label: "الفترات الأكاديمية" },
  { href: "/admin/assignments", label: "توزيع المدرسين" },
  { href: "/admin/enrollments", label: "التسجيلات" },
  { href: "/admin/schedule", label: "الجدول الأسبوعي" },
  { href: "/admin/templates", label: "القوالب" },
  { href: "/admin/progress", label: "تقدم المستخدمين" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href));

  const pageTitle = navItems.find((i) => isActive(i.href))?.label || "الإدارة";

  return (
    <div className="flex min-h-screen bg-[#0f172a]" dir="rtl">
      <AdminSidebar
        mobileOpen={mobileOpen}
        collapsed={collapsed}
        onCloseMobile={() => setMobileOpen(false)}
        onToggleCollapsed={() => setCollapsed(!collapsed)}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          collapsed ? "lg:mr-16" : "lg:mr-64"
        } max-lg:mr-0`}
      >
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#334155]/40 bg-[#0f172a]/80 px-6 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#334155]/50 hover:text-[#d4a843] transition-colors lg:hidden"
              aria-label={mobileOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
            <h2 className="text-sm font-medium text-[#f1f5f9]">{pageTitle}</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className="hidden sm:block text-[10px] text-[#64748b] tracking-wider">
              {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e293b] ring-1 ring-[#d4a843]/20">
              <Image src="/ERB.png" alt="" width={300} height={359} className="h-5 w-5 object-contain" />
            </div>
          </div>
        </header>

        <div className="p-6 pb-20 sm:pb-6">
          {children}
        </div>
      </main>

      <BottomNav role="ADMIN" />
    </div>
  );
}
