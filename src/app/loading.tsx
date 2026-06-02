import { CardSkeleton } from "@/components/ui/Skeleton";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#d4a843] border-t-transparent" />
        </div>
        <CardSkeleton count={3} />
      </div>
    </div>
  );
}
