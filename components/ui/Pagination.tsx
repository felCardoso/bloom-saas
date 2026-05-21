"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card">
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        Mostrando{" "}
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          {start}–{end}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
          {totalItems}
        </span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Página anterior"
          className={cn(
            "p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors",
            page === 1
              ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 text-xs font-medium text-neutral-600 dark:text-neutral-300 tabular-nums">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Próxima página"
          className={cn(
            "p-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors",
            page === totalPages
              ? "text-neutral-300 dark:text-neutral-600 cursor-not-allowed"
              : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
