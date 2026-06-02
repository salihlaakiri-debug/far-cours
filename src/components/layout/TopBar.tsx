"use client";

import Link from "next/link";
import Image from "next/image";
import { NotificationBell } from "@/components/NotificationBell";
import LogoutButton from "@/components/LogoutButton";

interface TopBarProps {
  user: {
    name: string;
    rank: string;
    role: string;
    militaryId: string;
  };
  onToggleSidebar?: () => void;
}

export function TopBar({ user, onToggleSidebar }: TopBarProps) {
  const roleLabel =
    user.role === "ADMIN" ? "مدير" :
    user.role === "INSTRUCTOR" ? "مدرب" : "تلميذ";

  const roleColors =
    user.role === "ADMIN" ? "bg-[#d4a843]/10 text-[#d4a843]" :
    user.role === "INSTRUCTOR" ? "bg-[#2563eb]/10 text-[#2563eb]" :
    "bg-[#22c55e]/10 text-[#22c55e]";

  return (
    <header className="sticky top-0 z-30 border-b border-[#334155]/40 bg-[#0f172a]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6" dir="rtl">
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748b] hover:bg-[#334155]/50 hover:text-[#d4a843] transition-colors lg:hidden"
              aria-label="فتح القائمة"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1e293b] p-1 ring-1 ring-[#d4a843]/20">
              <Image src="/ERB.png" alt="ERB" width={300} height={359} className="h-full w-full object-contain" />
            </div>
            <span className="hidden sm:block text-sm font-bold text-[#d4a843]">سلاح المدرعات</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider ${roleColors}`}>
              {roleLabel}
            </span>
            <span className="text-sm text-[#f1f5f9]">{user.rank} / {user.name}</span>
          </div>
          <NotificationBell />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
