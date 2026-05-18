"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
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
    <html lang="pt-BR">
      <body className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 p-6 text-center font-sans">
        <p className="text-7xl font-black text-rose-500 mb-4 leading-none">!</p>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Erro crítico
        </h1>
        <p className="text-sm text-neutral-500 mb-8 max-w-xs">
          Ocorreu um erro inesperado no aplicativo. Recarregue a página para tentar novamente.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Recarregar
        </button>
      </body>
    </html>
  );
}
