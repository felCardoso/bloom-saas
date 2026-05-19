"use client";

import { Bell, Search, Sparkles, Zap } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { usePlan } from "@/lib/plan-context";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do seu negócio" },
  "/clientes": { title: "Clientes", subtitle: "Gerencie sua carteira" },
  "/pedidos": { title: "Pedidos", subtitle: "Controle suas vendas" },
  "/produtos": { title: "Produtos", subtitle: "Catálogo e estoque" },
  "/agenda": { title: "Agenda", subtitle: "Follow-ups e lembretes" },
  "/relatorios": { title: "Relatórios", subtitle: "Análise de desempenho" },
  "/pricing": { title: "Planos", subtitle: "Gerencie sua assinatura" },
  "/configuracoes": {
    title: "Configurações",
    subtitle: "Preferências da conta",
  },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "Bloom", subtitle: "" };
  const [searchOpen, setSearchOpen] = useState(false);
  const { planId } = usePlan();

  return (
    <header className="h-14 lg:h-16 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
      {/* Mobile logo → /dashboard */}
      <Link href="/dashboard" className="flex items-center gap-1.5 lg:hidden">
        <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      </Link>

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-sm lg:text-base font-semibold text-neutral-800 dark:text-neutral-100 truncate">
          {page.title}
        </h1>
        <p className="text-[11px] lg:text-xs text-neutral-400 dark:text-neutral-500 hidden sm:block">
          {page.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {/* Upgrade chip */}
        {planId !== "premium" && (
          <Link
            href="/pricing"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-100 dark:border-rose-800"
          >
            <Zap className="w-3.5 h-3.5" />
            {planId === "free" ? "Upgrade" : "Plano Pro"}
          </Link>
        )}

        {/* Search */}
        {searchOpen ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
            <input
              autoFocus
              type="text"
              placeholder="Buscar..."
              onBlur={() => setSearchOpen(false)}
              className="pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-48 lg:w-56 transition-all"
            />
          </div>
        ) : (
          <>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Buscar cliente, pedido..."
                className="pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-48 transition-all"
              />
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Search size={18} />
            </button>
          </>
        )}

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-neutral-950" />
        </button>
      </div>
    </header>
  );
}
