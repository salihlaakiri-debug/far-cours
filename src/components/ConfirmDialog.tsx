"use client";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  danger = false,
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm max-sm:backdrop-blur-none p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md animate-scale-in rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              danger ? "bg-[#ef4444]/15" : "bg-[#d4a843]/15"
            }`}
          >
            {danger ? (
              <svg className="h-5 w-5 text-[#ef4444]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-[#f1f5f9]">{title}</h3>
          </div>
        </div>
        <p className="mb-6 text-sm text-[#94a3b8] pr-[52px]">{message}</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-[#334155] px-4 py-2.5 text-sm text-[#94a3b8] hover:bg-[#334155]/30 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-4 py-2.5 text-sm text-white transition-colors disabled:opacity-50 ${
              danger
                ? "bg-[#ef4444] hover:bg-[#dc2626]"
                : "bg-[#2563eb] hover:bg-[#1d4ed8]"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                جاري...
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
