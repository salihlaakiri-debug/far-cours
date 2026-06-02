"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "./ToastProvider";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications?limit=10");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function handleMarkRead(id: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  async function handleMarkAllRead() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast("success", "طھظ… طھط­ط¯ظٹط¯ ط§ظ„ظƒظ„ ظƒظ…ظ‚ط±ظˆط،");
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "ط§ظ„ط¢ظ†";
    if (diff < 3600000) return `ظ…ظ†ط° ${Math.floor(diff / 60000)} ط¯`;
    if (diff < 86400000) return `ظ…ظ†ط° ${Math.floor(diff / 3600000)} ط³`;
    return d.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });
  }

  function getTypeColor(type: string): string {
    if (type.includes("UPLOADED") || type.includes("CREATED")) return "text-[#22c55e]";
    if (type.includes("DELETED")) return "text-[#ef4444]";
    if (type.includes("PUBLISHED")) return "text-[#d4a843]";
    if (type.includes("UPDATED")) return "text-[#2563eb]";
    return "text-[#94a3b8]";
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-[#94a3b8] hover:bg-[#334155]/50 hover:text-[#f1f5f9] transition-colors"
        title="ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#ef4444] px-1 text-[9px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-screen max-w-[calc(100vw-32px)] sm:w-80 origin-top-left animate-scale-in overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b] to-[#0f172a] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#334155]/40 px-4 py-3">
            <span className="text-sm font-bold text-[#f1f5f9]">ط§ظ„ط¥ط´ط¹ط§ط±ط§طھ</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-medium text-[#2563eb] hover:text-[#60a5fa] transition-colors"
              >
                طھط­ط¯ظٹط¯ ط§ظ„ظƒظ„ ظ…ظ‚ط±ظˆط،
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2563eb] border-t-transparent" />
              </div>
            )}

            {!loading && notifications.length === 0 && (
              <div className="py-8 text-center">
                <svg className="mx-auto mb-2 h-8 w-8 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0" />
                </svg>
                <p className="text-xs text-[#64748b]">ظ„ط§ طھظˆط¬ط¯ ط¥ط´ط¹ط§ط±ط§طھ</p>
              </div>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                className={`border-b border-[#334155]/20 px-4 py-3 transition-colors hover:bg-[#334155]/30 ${
                  !n.read ? "bg-[#2563eb]/5" : ""
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">
                    {!n.read && (
                      <span className="flex h-2 w-2 rounded-full bg-[#2563eb]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold tracking-wider ${getTypeColor(n.type)}`}>
                        {n.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] text-[#64748b]">{formatDate(n.createdAt)}</span>
                    </div>
                    <p className="mt-0.5 text-sm font-medium text-[#f1f5f9]">{n.title}</p>
                    <p className="text-xs text-[#94a3b8] line-clamp-2">{n.message}</p>
                    {n.link && (
                      <a
                        href={n.link}
                        className="mt-1 inline-block text-[11px] font-medium text-[#2563eb] hover:text-[#60a5fa] transition-colors"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        ط¹ط±ط¶ ط§ظ„طھظپط§طµظٹظ„
                      </a>
                    )}
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 rounded p-1 text-[#64748b] hover:bg-[#334155]/50 hover:text-[#f1f5f9] transition-colors"
                      title="طھط­ط¯ظٹط¯ ظƒظ…ظ‚ط±ظˆط،"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

