export default function FeedbackLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 shadow-card animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-32 bg-neutral-200 dark:bg-neutral-700 rounded" />
            <div className="h-2.5 w-48 bg-neutral-100 dark:bg-neutral-800 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-28 bg-neutral-100 dark:bg-neutral-800 rounded-xl" />
          <div className="h-10 w-24 ml-auto bg-neutral-200 dark:bg-neutral-700 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
