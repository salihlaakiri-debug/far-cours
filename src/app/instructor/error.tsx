"use client";

import { useEffect } from "react";

export default function InstructorError({
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
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-lg font-bold text-[#f1f5f9]">حدث خطأ</h2>
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
