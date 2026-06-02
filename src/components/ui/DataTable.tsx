"use client";

import { useState, useMemo } from "react";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  onRowClick?: (item: T) => void;
  mobileCard?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  loading = false,
  searchable = false,
  searchPlaceholder = "بحث...",
  emptyTitle = "لا توجد بيانات",
  emptyDescription,
  emptyAction,
  onRowClick,
  mobileCard,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const val = (item as Record<string, unknown>)[col.key];
        return String(val ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortKey];
      const bVal = (b as Record<string, unknown>)[sortKey];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""), "ar");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5">
        <Skeleton className="h-8 w-full mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              {columns.map((col) => (
                <Skeleton key={col.key} className="h-6 flex-1" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80">
        {searchable && (
          <div className="border-b border-[#334155]/40 px-5 py-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-4 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            />
          </div>
        )}
        <EmptyState
          title={search ? "لا توجد نتائج للبحث" : emptyTitle}
          description={search ? "حاول تغيير كلمات البحث" : emptyDescription}
          action={emptyAction}
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-lg shadow-black/10 backdrop-blur-sm">
      {searchable && (
        <div className="border-b border-[#334155]/40 px-5 py-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-[#334155] bg-[#0f172a]/80 px-4 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20"
            dir="rtl"
          />
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#334155]/40">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-right text-[11px] font-bold tracking-wider text-[#64748b] ${
                    col.sortable ? "cursor-pointer select-none hover:text-[#d4a843] transition-colors" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.label}</span>
                    {col.sortable && sortKey === col.key && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={sortDir === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#334155]/40">
            {sorted.map((item) => (
              <tr
                key={keyExtractor(item)}
                className={`transition-colors hover:bg-[#334155]/20 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-sm text-[#f1f5f9]">
                    {col.render
                      ? col.render(item)
                      : String((item as Record<string, unknown>)[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden divide-y divide-[#334155]/40">
        {sorted.map((item) => (
          <div
            key={keyExtractor(item)}
            className={`px-4 py-3 ${onRowClick ? "cursor-pointer active:bg-[#334155]/20" : ""}`}
            onClick={() => onRowClick?.(item)}
          >
            {mobileCard ? (
              mobileCard(item)
            ) : (
              <div className="space-y-2">
                {columns
                  .filter((col) => !col.hideOnMobile)
                  .map((col) => (
                    <div key={col.key} className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider text-[#64748b]">{col.label}</span>
                      <span className="text-sm text-[#f1f5f9]">
                        {col.render
                          ? col.render(item)
                          : String((item as Record<string, unknown>)[col.key] ?? "")}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Count */}
      <div className="border-t border-[#334155]/40 px-5 py-2 text-[10px] text-[#64748b]">
        {sorted.length} نتيجة
      </div>
    </div>
  );
}
