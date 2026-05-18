"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Algo deu errado
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs">
        Não foi possível carregar esta página. Tente novamente ou volte ao início.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar novamente
        </button>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl font-semibold text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
        >
          <Home className="w-4 h-4" />
          Início
        </Link>
      </div>
    </div>
  );
}
