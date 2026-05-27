import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Tab bar — icon-only on mobile (w-9), icon+text on sm+ (w-24) */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-9 sm:w-24 rounded-xl shrink-0" />
        ))}
      </div>

      {/* Content card */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-card overflow-hidden space-y-4 sm:space-y-6">
        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-14 w-14 rounded-full shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </div>
        </div>

        {/* Form fields: 2 on mobile, 4 in 2-col grid on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn("space-y-2", i >= 2 && "hidden sm:block")}>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Save button */}
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
    </div>
  );
}
