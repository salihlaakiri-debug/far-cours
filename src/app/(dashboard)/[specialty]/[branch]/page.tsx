import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const categoryMeta: Record<string, { code: string; icon: string; color: string }> = {
  "premiere-annee": { code: "1A", icon: "I", color: "from-blue-900/30 to-blue-900/10" },
  "deuxieme-annee": { code: "2A", icon: "II", color: "from-amber-900/30 to-amber-900/10" },
};

function StatusIcon({ type }: { type: "completed" | "progress" | "new" }) {
  if (type === "completed") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    );
  }
  if (type === "progress") {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12h2m16 0h2M12 2v2m0 16v2" />
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l2.5 2.5" />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14m-7-7h14" />
    </svg>
  );
}

type LessonWithProgress = {
  id: string;
  title: string;
  description: string | null;
  code: string;
  order: number;
  isCompleted: boolean;
  lastPage: number;
};

function LessonCard({ lesson, specialtySlug, branchSlug, index }: { lesson: LessonWithProgress; specialtySlug: string; branchSlug: string; index: number }) {
  const statusType = lesson.isCompleted ? "completed" : lesson.lastPage > 0 ? "progress" : "new";

  const statusConfig = {
    completed: {
      label: "Validé",
      badgeBg: "bg-green-900/25",
      badgeText: "text-green-400",
      badgeRing: "ring-green-800/40",
      numberBg: "bg-green-900/30",
      numberText: "text-green-400",
      numberRing: "ring-green-800/30",
    },
    progress: {
      label: `p.${lesson.lastPage}`,
      badgeBg: "bg-blue-900/25",
      badgeText: "text-blue-400",
      badgeRing: "ring-blue-800/40",
      numberBg: "bg-blue-900/25",
      numberText: "text-blue-400",
      numberRing: "ring-blue-800/30",
    },
    new: {
      label: "Nouveau",
      badgeBg: "bg-zinc-800/60",
      badgeText: "text-zinc-400",
      badgeRing: "ring-zinc-700/40",
      numberBg: "bg-zinc-800/60",
      numberText: "text-zinc-400",
      numberRing: "ring-zinc-700/40",
    },
  };

  const cfg = statusConfig[statusType];

  return (
    <Link
      href={`/${specialtySlug}/${branchSlug}/${lesson.id}`}
      className="group relative block animate-fade-up overflow-hidden rounded-xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/70 to-[#0f172a]/70 shadow-lg shadow-black/10 backdrop-blur-sm transition-all duration-300 hover:border-[#d4a843]/30 hover:shadow-xl hover:shadow-[#d4a843]/5 hover:-translate-y-0.5"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-l from-[#d4a843]/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex items-center gap-4 p-4 sm:gap-5 sm:p-5">
        {/* Lesson Number */}
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold shadow-inner shadow-black/20 ring-1 transition-all duration-300 ${cfg.numberBg} ${cfg.numberText} ${cfg.numberRing} group-hover:scale-110`}>
          {lesson.isCompleted ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <span>{lesson.order}</span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-[#334155]/40 px-1.5 py-0.5 text-[10px] font-mono font-medium text-[#64748b] tracking-wider">
              {lesson.code}
            </span>
          </div>
          <h3 className="mt-1 font-bold text-[#f1f5f9] transition-colors duration-200 group-hover:text-[#d4a843]">
            {lesson.title}
          </h3>
          {lesson.description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[#64748b] line-clamp-1">
              {lesson.description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 transition-all duration-200 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeRing} group-hover:scale-105`}>
          <StatusIcon type={statusType} />
          <span>{cfg.label}</span>
        </div>

        {/* Chevron */}
        <svg className="h-4 w-4 shrink-0 text-[#334155] transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-[#d4a843]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </Link>
  );
}

export default async function BranchPage({
  params,
}: {
  params: Promise<{ specialty: string; branch: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { specialty: specialtySlug, branch: branchSlug } = await params;

  const specialty = await prisma.specialty.findUnique({
    where: { slug: specialtySlug },
  });
  if (!specialty) notFound();

  const branch = await prisma.branch.findUnique({
    where: { specialtyId_slug: { specialtyId: specialty.id, slug: branchSlug } },
    include: {
      lessons: { orderBy: { order: "asc" } },
    },
  });
  if (!branch) notFound();

  const progress = await prisma.userProgress.findMany({
    where: {
      userId: session.user.id,
      lessonId: { in: branch.lessons.map((l) => l.id) },
    },
  });

  const progressMap = new Map(progress.map((p) => [p.lessonId, p]));
  const completedCount = progress.filter((p) => p.completedAt).length;
  const meta = categoryMeta[branchSlug] || { code: "00", icon: "—", color: "from-slate-900/30 to-slate-900/10" };
  const total = branch.lessons.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // Group lessons by status
  const grouped = branch.lessons.reduce(
    (acc, lesson, idx) => {
      const prog = progressMap.get(lesson.id);
      const isCompleted = !!prog?.completedAt;
      const lastPage = prog?.lastPage || 0;
      const code = `${meta.code}-${String(idx + 1).padStart(2, "0")}`;

      const item: LessonWithProgress = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        code,
        order: idx + 1,
        isCompleted,
        lastPage,
      };

      if (isCompleted) acc.completed.push(item);
      else if (lastPage > 0) acc.inProgress.push(item);
      else acc.new.push(item);

      return acc;
    },
    { completed: [] as LessonWithProgress[], inProgress: [] as LessonWithProgress[], new: [] as LessonWithProgress[] }
  );

  const sections: { key: string; title: string; lessons: LessonWithProgress[]; countLabel: string; emptyLabel: string }[] = [
    { key: "completed", title: "Validées", lessons: grouped.completed, countLabel: "terminée(s)", emptyLabel: "Aucune matière validée" },
    { key: "progress", title: "En cours", lessons: grouped.inProgress, countLabel: "en cours", emptyLabel: "Aucune matière en cours" },
    { key: "new", title: "Nouvelles", lessons: grouped.new, countLabel: "nouvelle(s)", emptyLabel: "Aucune nouvelle matière" },
  ];

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0f172a]" />
      <div className="fixed inset-0 opacity-[0.15]">
        <div className="absolute right-1/4 top-0 h-72 w-72 rounded-full bg-[#2563eb] blur-[140px]" />
        <div className="absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-[#d4a843] blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8" dir="rtl">
        {/* Back */}
        <div className="mb-5 animate-fade-up">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-[#64748b] transition-all hover:bg-[#334155]/30 hover:text-[#d4a843]"
          >
            <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19l-7-7 7-7" />
            </svg>
            العودة إلى الأقسام
          </Link>
        </div>

        {/* Module Header */}
        <div className="animate-scale-in mb-6 overflow-hidden rounded-2xl border border-[#334155]/40 bg-gradient-to-br from-[#1e293b]/80 to-[#0f172a]/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-1.5 shadow-lg ring-1 ring-[#d4a843]/20">
                <span className="text-lg font-bold text-[#d4a843]">{meta.icon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#d4a843]/10 px-2 py-0.5 text-[11px] font-bold text-[#d4a843] tracking-widest">
                    {meta.code} MODULE
                  </span>
                  <span className="rounded-md bg-[#334155]/40 px-2 py-0.5 text-[10px] font-mono text-[#64748b]">
                    {branchSlug}
                  </span>
                </div>
                <h1 className="mt-1 text-xl font-extrabold text-[#f1f5f9] sm:text-2xl">
                  {branch.name}
                </h1>
                <p className="mt-0.5 text-sm text-[#94a3b8]">
                  {specialty.name} — القوات المسلحة الملكية
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-4">
              <div className="text-left">
                <div className="text-2xl font-extrabold text-[#d4a843]">{completedCount}/{total}</div>
                <div className="text-[10px] text-[#64748b] tracking-wider">MATIÈRES COMPLÉTÉES</div>
              </div>
              <div className="hidden sm:block">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#334155]/30 ring-1 ring-[#334155]/40">
                  <span className="text-sm font-bold text-[#d4a843]">{progressPct}%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative h-1.5 w-full bg-[#334155]/50">
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#d4a843] to-[#2563eb] transition-all duration-1000 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Lessons by status */}
        {sections.map((section) => {
          if (section.lessons.length === 0) return null;

          return (
            <div key={section.key} className="mb-8">
              {/* Section Header */}
              <div className="animate-fade-up mb-3 flex items-center gap-3">
                <h2 className="text-sm font-bold text-[#f1f5f9]">{section.title}</h2>
                <span className="rounded-md bg-[#334155]/40 px-2 py-0.5 text-[10px] font-medium text-[#64748b]">
                  {section.lessons.length}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-[#334155]/60 to-transparent" />
              </div>

              {/* Lesson Cards */}
              <div className="space-y-2.5 sm:space-y-3">
                {section.lessons.map((lesson, i) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    specialtySlug={specialtySlug}
                    branchSlug={branchSlug}
                    index={i}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty state if no lessons at all */}
        {total === 0 && (
          <div className="animate-fade-in flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155]/40 py-16">
            <svg className="mb-4 h-12 w-12 text-[#334155]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-sm text-[#64748b]">Aucune matière disponible dans ce module</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center text-[10px] text-[#64748b] tracking-wider">
          ROYAUME DU MAROC • FORCES ARMÉES ROYALES • ÉCOLE DES OFFICIERS • ARMES BLINDÉES
        </div>
      </div>
    </div>
  );
}
