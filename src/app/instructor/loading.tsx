import { CardSkeleton, Skeleton } from "@/components/ui/Skeleton";

export default function InstructorLoading() {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}
