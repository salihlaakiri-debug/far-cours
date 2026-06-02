"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <svg className="mx-auto mb-4 h-16 w-16 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <h2 className="text-lg font-bold text-[#f1f5f9]">حدث خطأ غير متوقع</h2>
        <p className="mt-2 text-sm text-[#94a3b8]">يرجى المحاولة مرة أخرى أو الاتصال بالدعم الفني</p>
        <button
          onClick={reset}
          className="mt-6 rounded-lg bg-[#d4a843] px-6 py-2 text-sm font-bold text-[#0f172a] transition-colors hover:bg-[#c49a3a]"
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
