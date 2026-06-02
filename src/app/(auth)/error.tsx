"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <svg className="mx-auto mb-4 h-14 w-14 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <h2 className="text-lg font-bold text-[#f1f5f9]">خطأ في تسجيل الدخول</h2>
        <p className="mt-2 text-sm text-[#94a3b8]">حدث خطأ أثناء محاولة تسجيل الدخول</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-lg bg-[#d4a843] px-5 py-2 text-sm font-bold text-[#0f172a] transition-colors hover:bg-[#c49a3a]"
          >
            إعادة المحاولة
          </button>
          <Link
            href="/login"
            className="rounded-lg border border-[#334155] px-5 py-2 text-sm font-bold text-[#94a3b8] transition-colors hover:bg-[#1e293b]"
          >
            العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
