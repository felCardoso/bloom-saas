import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1 sm:w-32 sm:flex-none rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-card space-y-1.5"
          >
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* Order cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card overflow-hidden"
          >
            <div className="flex items-start gap-3 px-4 py-4">
              <Skeleton className="h-10 w-10 rounded-full shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <div className="shrink-0 space-y-1.5">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-3 w-10 ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
