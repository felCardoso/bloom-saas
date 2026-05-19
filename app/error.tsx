"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function Error({
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 text-center">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <img src="/logo.svg" className="w-8 h-8" alt="Bloom" />
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
      </Link>

      <div className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-5">
        <span className="text-2xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Algo deu errado
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs">
        Ocorreu um erro inesperado. Tente novamente ou volte para o dashboard.
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
          Ir para o dashboard
        </Link>
      </div>
    </div>
  );
}
