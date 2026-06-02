import { TableSkeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="animate-pulse h-8 w-48 rounded-lg bg-[#334155]/30" />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}
