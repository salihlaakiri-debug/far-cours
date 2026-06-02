"use client";

import { useEffect } from "react";

export default function ProfileError({
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
        <h2 className="text-lg font-bold text-[#f1f5f9]">حدث خطأ في الملف الشخصي</h2>
        <p className="mt-2 text-sm text-[#94a3b8]">يرجى المحاولة مرة أخرى</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#d4a843] px-5 py-2 text-sm font-bold text-[#0f172a] transition-colors hover:bg-[#c49a3a]"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
