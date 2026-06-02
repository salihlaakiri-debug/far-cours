"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
  pointerWithin,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import ScheduleConflictChecker from "@/components/ScheduleConflictChecker";

const DAYS = ["الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const HOURS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
const COLUMN_TOP_MIN = timeToMin("08:00");

function timeToMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function minToTime(m: number) {
  const h = Math.floor(m / 60);
  const mn = m % 60;
  return `${String(h).padStart(2, "0")}:${String(mn).padStart(2, "0")}`;
}

function DayColumnDroppable({ dayIndex, children }: { dayIndex: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `day-${dayIndex}`, data: { dayIndex } });
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 border-l border-[#334155]/20 last:border-l-0 transition-colors duration-150 ${
        isOver ? "bg-[#2563eb]/8" : ""
      }`}
    >
      {children}
      {isOver && (
        <div className="pointer-events-none absolute inset-0 rounded-lg border-2 border-dashed border-[#2563eb]/50" />
      )}
    </div>
  );
}

interface LessonMini {
  id: string;
  title: string;
}

interface SessionData {
  id: string;
  title: string;
  instructorName: string | null;
  room: string | null;
  date: string;
  startTime: string;
  endTime: string;
  lessonId: string | null;
  lesson?: { id: string; title: string } | null;
  sessionNum?: number | null;
  sessionType?: string;
  isContinuation?: boolean;
}

interface WeekData {
  id: string;
  branchId: string;
  weekStart: string;
  status: string;
  branch?: { name: string };
  sessions: SessionData[];
}

function SessionBlock({
  session,
  dayIndex,
  isDragOverlay,
  onEdit,
  onDelete,
}: {
  session: SessionData;
  dayIndex: number;
  isDragOverlay?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sStart = timeToMin(session.startTime);
  const sEnd = timeToMin(session.endTime);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `session-${session.id}`,
    data: { session, dayIndex },
    disabled: isDragOverlay,
  });

  const style: React.CSSProperties = {
    top: `${sStart - COLUMN_TOP_MIN}px`,
    height: `${sEnd - sStart}px`,
    opacity: isDragOverlay ? 0.9 : isDragging ? 0.3 : 1,
    zIndex: isDragging ? 50 : isDragOverlay ? 999 : 10,
    transform: transform && !isDragOverlay ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    transition: isDragging ? "none" : undefined,
    touchAction: "none",
  };

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      {...(isDragOverlay ? {} : { ...listeners, ...attributes })}
      style={style}
      className={`absolute right-1 left-1 rounded-lg border p-1.5 overflow-hidden group ${
        isDragOverlay
          ? "bg-[#2563eb]/30 border-[#2563eb]/60 shadow-xl shadow-black/50 rotate-[2deg]"
          : "bg-[#2563eb]/15 border-[#2563eb]/30 cursor-grab active:cursor-grabbing"
      }`}
    >
      <div className="flex items-center gap-1 mb-0.5">
        <svg className={`w-2.5 h-2.5 shrink-0 ${isDragOverlay ? "text-[#d4a843]" : "text-[#64748b]"}`} viewBox="0 0 10 10" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="5" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="5" r="1.5" />
          <circle cx="5" cy="5" r="1.5" />
          <circle cx="8" cy="5" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="5" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
        </svg>
        <div className="text-[9px] font-bold text-[#f1f5f9] leading-tight truncate">{session.title}</div>
      </div>
      {session.instructorName && <div className="text-[8px] text-[#94a3b8] truncate">{session.instructorName}</div>}
      {session.room && <div className="text-[8px] text-[#64748b] truncate">{session.room}</div>}
      {!isDragOverlay && (
        <div className="absolute left-1 top-1 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="rounded bg-[#0f172a]/80 px-1 py-0.5 text-[7px] text-[#94a3b8] hover:text-[#d4a843]"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.5 1.5L10.5 3.5L4.5 9.5L1.5 10.5L2.5 7.5L8.5 1.5Z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="rounded bg-[#0f172a]/80 px-1 py-0.5 text-[7px] text-[#94a3b8] hover:text-red-400"
          >
            <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 3H10" /><path d="M4 3V1.5C4 1.2 4.2 1 4.5 1H7.5C7.8 1 8 1.2 8 1.5V3" /><path d="M9.5 3V10.5C9.5 10.8 9.3 11 9 11H3C2.7 11 2.5 10.8 2.5 10.5V3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

export default function WeekEditorPage() {
  const { toast } = useToast();
  const params = useParams();
  const router = useRouter();
  const weekId = params.weekId as string;

  const [week, setWeek] = useState<WeekData | null>(null);
  const [lessons, setLessons] = useState<LessonMini[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [conflictRefresh, setConflictRefresh] = useState(0);
  const [editing, setEditing] = useState<SessionData | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [room, setRoom] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("0");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("11:00");
  const [lessonId, setLessonId] = useState("");

  // View mode
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // DnD state
  const [activeSession, setActiveSession] = useState<SessionData | null>(null);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  async function load() {
    const [wRes, lRes] = await Promise.all([
      fetch(`/api/schedule/weeks?includeSessions=true`),
      fetch(`/api/lessons`),
    ]);
    const weeks: WeekData[] = await wRes.json();
    const found = weeks.find((w) => w.id === weekId);

    setWeek(found || null);
    setLessons(await lRes.json());
    setConflictRefresh((n) => n + 1);
  }

  useEffect(() => { load(); }, [weekId]);

  function resetForm() {
    setTitle("");
    setInstructorName("");
    setRoom("");
    setDayOfWeek("0");
    setStartTime("09:00");
    setEndTime("11:00");
    setLessonId("");
    setEditing(null);
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !week) return;

    const baseDate = new Date(week.weekStart);
    baseDate.setDate(baseDate.getDate() + parseInt(dayOfWeek));

    const url = editing
      ? `/api/schedule/sessions?id=${editing.id}`
      : `/api/schedule/sessions`;

    const res = await fetch(url, {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weeklyScheduleId: weekId,
        lessonId: lessonId || undefined,
        instructorName: instructorName || undefined,
        room: room || undefined,
        date: baseDate.toISOString(),
        startTime,
        endTime,
        title,
      }),
    });

    if (res.ok) {
      resetForm();
      toast("success", editing ? "تم تحديث الحصة" : "تم إضافة الحصة");
      load();
    } else {
      const err = await res.json().catch(() => ({ error: "فشل العملية" }));
      toast("error", err.error || "فشل العملية");
    }
  }

  async function deleteSession(id: string) {
    setConfirmDeleteId(id);
  }

  async function confirmDeleteSession(id: string) {
    try {
      const res = await fetch(`/api/schedule/sessions?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("فشل حذف الحصة");
      toast("success", "تم حذف الحصة");
      setConfirmDeleteId(null);
      load();
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
      setConfirmDeleteId(null);
    }
  }

  async function exportToTemplate() {
    if (!week) return;
    const name = prompt("اسم القالب:");
    if (!name) return;
    try {
      const res = await fetch("/api/schedule/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, branchId: week.branchId, description: "منسوخ من أسبوع موجود" }),
      });
      if (!res.ok) throw new Error("فشل إنشاء القالب");
      toast("success", `تم إنشاء القالب "${name}"`);
    } catch (err) {
      toast("error", err instanceof Error ? err.message : "حدث خطأ");
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const data = active.data.current as { session: SessionData; dayIndex: number } | null;
    if (!data) return;
    setActiveSession(data.session);
    setActiveDayIndex(data.dayIndex);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over, delta } = event;
    setActiveSession(null);

    if (!over || !active.data.current || !week) return;

    const session = active.data.current.session;
    const toDayIndex = over.data.current?.dayIndex as number ?? parseInt(over.id.toString().replace("day-", ""));
    if (toDayIndex === undefined || toDayIndex < 0 || toDayIndex > 4) return;

    const originalStart = timeToMin(session.startTime);
    const originalEnd = timeToMin(session.endTime);
    const deltaMin = Math.round(delta.y);

    let newStartMin = originalStart + deltaMin;
    let newEndMin = originalEnd + deltaMin;

    // Clamp to grid boundaries (08:00 - 18:00)
    newStartMin = Math.max(COLUMN_TOP_MIN, Math.min(timeToMin("18:00"), newStartMin));
    newEndMin = Math.max(newStartMin + 30, Math.min(timeToMin("18:00"), newEndMin));

    const newStart = minToTime(newStartMin);
    const newEnd = minToTime(newEndMin);

    const baseDate = new Date(week.weekStart);
    const newDate = new Date(baseDate);
    newDate.setDate(baseDate.getDate() + toDayIndex);

    try {
      const res = await fetch(`/api/schedule/sessions?id=${session.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate.toISOString(),
          startTime: newStart,
          endTime: newEnd,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to update session:", text);
        toast("error", "فشل تحديث موقع الحصة");
        return;
      }
      toast("success", "تم تحديث موقع الحصة");
    } catch (err) {
      console.error("Failed to update session:", err);
      toast("error", "حدث خطأ أثناء تحديث الحصة");
    }

    load();
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const weekStart = week ? new Date(week.weekStart) : new Date();
  const sessionsByDay = week
    ? DAYS.map((_, di) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + di);
        return (week.sessions || []).filter((s) => {
          const sd = new Date(s.date);
          return sd.getDate() === d.getDate() && sd.getMonth() === d.getMonth() && sd.getFullYear() === d.getFullYear();
        });
      })
    : [];

  if (!week) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[#94a3b8]">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <><div dir="rtl">
        {/* Header */}
        <div className="mb-6 animate-fade-up overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push("/admin/schedule")} className="text-sm text-[#64748b] hover:text-[#d4a843] transition-colors">
                ←
              </button>
              <div>
                <h1 className="text-lg font-bold text-[#d4a843]">{week.branch?.name}</h1>
                <p className="text-xs text-[#64748b]">{weekStart.toLocaleDateString("fr-FR")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 rounded-lg bg-[#0f172a]/60 p-0.5 ring-1 ring-[#334155]/50">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                    viewMode === "grid"
                      ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                      : "text-[#64748b] hover:text-[#94a3b8]"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                  شبكي
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                    viewMode === "list"
                      ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                      : "text-[#64748b] hover:text-[#94a3b8]"
                  }`}
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  قائمة
                </button>
              </div>
              <button
                onClick={() => setShowConflicts((v) => !v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  showConflicts
                    ? "bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30"
                    : "bg-[#334155]/50 text-[#94a3b8] hover:bg-[#334155]"
                }`}
              >
                {showConflicts ? "إخفاء" : "تحقق من التعارضات"}
              </button>
              <button onClick={() => exportToTemplate()} className="rounded-lg bg-[#334155]/50 px-3 py-1.5 text-xs text-[#94a3b8] hover:bg-[#334155] transition-colors">
                حفظ كقالب
              </button>
              <button onClick={() => setShowForm(true)} className="rounded-lg bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1d4ed8] transition-colors">
                + إضافة حصة
              </button>
            </div>
          </div>
          <div className="h-0.5 w-full bg-gradient-to-l from-[#d4a843] via-[#2563eb] to-transparent" />
        </div>

        {/* Add/edit form */}
        {showForm && (
          <div className="animate-fade-up mb-6 rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-[#f1f5f9] mb-4">{editing ? "تعديل الحصة" : "إضافة حصة جديدة"}</h2>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="عنوان الحصة" required
                className="flex-1 min-w-[150px] rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={instructorName} onChange={(e) => setInstructorName(e.target.value)}
                placeholder="الأستاذ" className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
              />
              <input
                value={room} onChange={(e) => setRoom(e.target.value)}
                placeholder="القاعة" className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] placeholder-[#64748b] focus:border-[#2563eb] focus:outline-none"
              />
              <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}
                className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
              >
                {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
              />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
              />
              <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}
                className="rounded-xl border border-[#334155] bg-[#0f172a]/80 px-3 py-2 text-sm text-[#f1f5f9] focus:border-[#2563eb] focus:outline-none"
              >
                <option value="">بدون درس</option>
                {lessons.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="rounded-xl bg-[#2563eb] px-4 py-2 text-sm font-medium text-white hover:bg-[#1d4ed8] transition-colors">
                  {editing ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={resetForm} className="rounded-xl bg-[#334155]/50 px-4 py-2 text-sm text-[#94a3b8] hover:bg-[#334155] transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conflict Checker */}
        {showConflicts && (
          <ScheduleConflictChecker weeklyScheduleId={weekId} refreshTrigger={conflictRefresh} />
        )}

        {/* Mobile view toggle */}
        <div className="sm:hidden mb-3 flex items-center gap-1 rounded-lg bg-[#0f172a]/80 p-0.5 ring-1 ring-[#334155]/50 w-fit">
          <button
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              viewMode === "grid"
                ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                : "text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            شبكي
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
              viewMode === "list"
                ? "bg-[#1e293b] text-[#d4a843] shadow-sm"
                : "text-[#64748b] hover:text-[#94a3b8]"
            }`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            قائمة
          </button>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
        <div className="animate-fade-up overflow-x-auto rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="flex border-b border-[#334155]/40">
              <div className="w-16 shrink-0 border-l border-[#334155]/40 p-2" />
              {DAYS.map((day, i) => (
                <div key={day} className="flex-1 p-2 text-center border-l border-[#334155]/40">
                  <div className="text-xs font-bold text-[#d4a843]">{day}</div>
                  <div className="text-[10px] text-[#64748b]">{new Date(weekStart.getTime() + i * 86400000).toLocaleDateString("fr-FR")}</div>
                </div>
              ))}
            </div>

            {/* Grid body with DnD */}
            <DndContext
              sensors={sensors}
              collisionDetection={pointerWithin}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="flex">
                {/* Time column */}
                <div className="w-16 shrink-0 border-l border-[#334155]/20">
                  {HOURS.map((hour) => (
                    <div key={hour} className="h-[60px] border-b border-[#334155]/20 p-2">
                      <span className="text-[10px] text-[#64748b]">{hour}</span>
                    </div>
                  ))}
                </div>

                {/* Day columns */}
                {DAYS.map((_, di) => (
                  <DayColumnDroppable key={di} dayIndex={di}>
                    {/* Hour background grid lines */}
                    {HOURS.map((hour) => (
                      <div key={hour} className="h-[60px] border-b border-[#334155]/20" />
                    ))}

                    {/* Sessions */}
                    {sessionsByDay[di].map((s) => (
                      <SessionBlock
                        key={s.id}
                        session={s}
                        dayIndex={di}
                        onEdit={() => {
                          setEditing(s);
                          setTitle(s.title);
                          setInstructorName(s.instructorName || "");
                          setRoom(s.room || "");
                          setDayOfWeek(String(di));
                          setStartTime(s.startTime);
                          setEndTime(s.endTime);
                          setLessonId(s.lessonId || "");
                          setShowForm(true);
                        }}
                        onDelete={() => confirmDeleteSession(s.id)}
                      />
                    ))}
                  </DayColumnDroppable>
                ))}
              </div>

              {/* Drag Overlay */}
              <DragOverlay dropAnimation={null}>
                {activeSession ? (
                  <SessionBlock
                    session={activeSession}
                    dayIndex={activeDayIndex}
                    isDragOverlay
                    onEdit={() => {}}
                    onDelete={() => {}}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="animate-fade-up space-y-5">
            {DAYS.map((day, di) => {
              const daySessions = sessionsByDay[di];
              const dayDate = new Date(weekStart.getTime() + di * 86400000);
              const isToday =
                dayDate.getDate() === new Date().getDate() &&
                dayDate.getMonth() === new Date().getMonth() &&
                dayDate.getFullYear() === new Date().getFullYear();
              if (daySessions.length === 0) return null;
              return (
                <div key={di}>
                  <div className={`flex items-center gap-2 mb-2 px-1 ${isToday ? "text-[#d4a843]" : "text-[#94a3b8]"}`}>
                    <span className="text-xs font-bold">{day}</span>
                    <span className="text-[10px]">{dayDate.toLocaleDateString("fr-FR")}</span>
                    {isToday && <span className="h-1.5 w-1.5 rounded-full bg-[#d4a843]" />}
                  </div>
                  <div className="space-y-2">
                    {daySessions.map((s) => {
                      const sStart = timeToMin(s.startTime);
                      const sEnd = timeToMin(s.endTime);
                      return (
                        <div
                          key={s.id}
                          className="rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-3 shadow-lg shadow-black/10"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-[#f1f5f9]">{s.title}</span>
                                {s.sessionNum && (
                                  <span className="rounded bg-[#2563eb]/10 px-1.5 py-0.5 text-[9px] font-medium text-[#2563eb]">
                                    #{s.sessionNum}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#94a3b8]">
                                <span className="inline-flex items-center gap-1">
                                  <svg className="h-3 w-3 text-[#2563eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {s.startTime.slice(0, 5)} — {s.endTime.slice(0, 5)}
                                  <span className="text-[#64748b]">({sEnd - sStart} دقيقة)</span>
                                </span>
                                {s.instructorName && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3 text-[#22c55e]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {s.instructorName}
                                  </span>
                                )}
                                {s.room && (
                                  <span className="inline-flex items-center gap-1">
                                    <svg className="h-3 w-3 text-[#d4a843]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    {s.room}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => {
                                  setEditing(s);
                                  setTitle(s.title);
                                  setInstructorName(s.instructorName || "");
                                  setRoom(s.room || "");
                                  setDayOfWeek(String(di));
                                  setStartTime(s.startTime);
                                  setEndTime(s.endTime);
                                  setLessonId(s.lessonId || "");
                                  setShowForm(true);
                                }}
                                className="rounded-lg bg-[#334155]/50 p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-[#d4a843] transition-colors"
                                title="تعديل"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M8.5 1.5L10.5 3.5L4.5 9.5L1.5 10.5L2.5 7.5L8.5 1.5Z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => confirmDeleteSession(s.id)}
                                className="rounded-lg bg-[#334155]/50 p-1.5 text-[#94a3b8] hover:bg-[#334155] hover:text-red-400 transition-colors"
                                title="حذف"
                              >
                                <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                                  <path d="M2 3H10" /><path d="M4 3V1.5C4 1.2 4.2 1 4.5 1H7.5C7.8 1 8 1.2 8 1.5V3" /><path d="M9.5 3V10.5C9.5 10.8 9.3 11 9 11H3C2.7 11 2.5 10.8 2.5 10.5V3" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {sessionsByDay.every((d) => d.length === 0) && (
              <div className="rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 p-8 text-center">
                <svg className="mx-auto mb-3 h-10 w-10 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-sm text-[#64748b]">لا توجد حصص في هذا الأسبوع</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-4 rounded-lg bg-[#d4a843] px-4 py-1.5 text-xs font-bold text-[#0f172a] transition-colors hover:bg-[#c49a3a]"
                >
                  إضافة أول حصة
                </button>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 text-[10px] text-[#64748b]">
          {week.sessions?.length || 0} حصة · الحالة: {week.status}
        </div>

        <div className="mt-6 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ADMINISTRATION
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="حذف الحصة"
        message="هل أنت متأكد من حذف هذه الحصة؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف"
        cancelLabel="إلغاء"
        danger
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          try {
            const res = await fetch(`/api/schedule/sessions?id=${confirmDeleteId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("فشل حذف الحصة");
            toast("success", "تم حذف الحصة");
            setConfirmDeleteId(null);
            load();
          } catch (err) {
            toast("error", err instanceof Error ? err.message : "حدث خطأ أثناء الحذف");
            setConfirmDeleteId(null);
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
  </>
  );
}

