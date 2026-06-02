import { Skeleton } from "@/components/ui/Skeleton";

export default function ScheduleLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-36" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[500px] w-full rounded-2xl" />
    </div>
  );
}
