import { Skeleton, TableRowSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl" />
      </div>
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <TableRowSkeleton key={i} cols={3} />
        ))}
      </div>
    </div>
  );
}
