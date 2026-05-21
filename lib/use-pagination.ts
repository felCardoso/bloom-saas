"use client";

import { useState } from "react";

export function usePagination<T>(
  items: T[],
  pageSize: number = 20,
  resetKey?: string,
) {
  const [page, setPage] = useState(1);
  const [prevKey, setPrevKey] = useState(resetKey);

  if (resetKey !== prevKey) {
    setPrevKey(resetKey);
    setPage(1);
  }

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
