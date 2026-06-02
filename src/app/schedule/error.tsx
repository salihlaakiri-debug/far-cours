"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ScheduleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <svg className="mx-auto mb-4 h-14 w-14 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <h2 className="text-lg font-bold text-[#f1f5f9]">حدث خطأ في جدول المواعيد</h2>
        <p className="mt-2 text-sm text-[#94a3b8]">يرجى المحاولة مرة أخرى</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[#d4a843] px-5 py-2 text-sm font-bold text-[#0f172a] transition-colors hover:bg-[#c49a3a]"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/schedule"
            className="rounded-lg border border-[#334155] px-5 py-2 text-sm font-bold text-[#94a3b8] transition-colors hover:bg-[#1e293b]"
          >
            العودة للجدول
          </Link>
        </div>
      </div>
    </div>
  );
}
