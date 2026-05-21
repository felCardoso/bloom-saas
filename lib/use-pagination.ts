"use client";

import { useState, useEffect } from "react";

export function usePagination<T>(items: T[], pageSize: number = 20, resetKey?: string) {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const paginated = items.slice(start, start + pageSize);

  return {
    paginated,
    page: safePage,
    setPage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}
