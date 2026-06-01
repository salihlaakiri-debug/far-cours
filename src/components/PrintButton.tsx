"use client";

export default function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-[#334155]/40 bg-[#1e293b]/60 px-3 py-2 text-xs text-[#94a3b8] transition-all hover:border-[#d4a843]/30 hover:text-[#d4a843] backdrop-blur-sm print:hidden ${className}`}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      طباعة
    </button>
  );
}
