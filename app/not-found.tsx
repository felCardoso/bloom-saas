import Link from "next/link";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-6 text-center">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
      </Link>

      <p className="text-7xl font-black text-rose-500 mb-4 leading-none">404</p>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
        Página não encontrada
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 max-w-xs">
        A página que você está procurando não existe ou foi movida.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para o dashboard
      </Link>
    </div>
  );
}
