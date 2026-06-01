import Link from "next/link";

interface LessonCardProps {
  id: string;
  title: string;
  description: string | null;
  index: number;
  specialtySlug: string;
  branchSlug: string;
  isCompleted: boolean;
  lastPage: number;
}

export default function LessonCard({
  id,
  title,
  description,
  index,
  specialtySlug,
  branchSlug,
  isCompleted,
  lastPage,
}: LessonCardProps) {
  return (
    <Link
      href={`/${specialtySlug}/${branchSlug}/${id}`}
      className="flex items-center gap-4 rounded-lg border border-[#334155] bg-[#1e293b] p-4 shadow-sm hover:border-[#2563eb] hover:bg-[#1e293b]/80 transition-all"
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${isCompleted ? "bg-green-900/50 text-[#22c55e]" : "bg-[#2563eb]/20 text-[#2563eb]"}`}>
        {isCompleted ? "✓" : index + 1}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-[#f1f5f9]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[#64748b]">{description}</p>
        )}
      </div>
      <div className="text-sm text-[#64748b]">
        {isCompleted
          ? <span className="text-[#22c55e]">✓ مكتمل</span>
          : lastPage > 0
          ? `الصفحة ${lastPage}`
          : "جديد"}
      </div>
    </Link>
  );
}
