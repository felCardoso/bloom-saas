"use client";

import { Search, Zap, Settings, LogOut } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar } from "@/components/ui/Avatar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePlan } from "@/lib/plan-context";
import { useProfile } from "@/lib/profile-context";
import { signOut } from "@/lib/actions/auth";

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
  const [profileOpen, setProfileOpen] = useState(false);
  const { planId } = usePlan();
  const { name, avatarUrl } = useProfile();
  const [, startTransition] = useTransition();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <header className="h-14 lg:h-16 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
      {/* Mobile: profile avatar with dropdown */}
      <div className="relative lg:hidden" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen((prev) => !prev)}
          className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
          aria-label="Perfil"
        >
          <Avatar name={name || "U"} src={avatarUrl} size="sm" />
        </button>

        {profileOpen && (
          <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-elevated overflow-hidden z-50">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <Avatar name={name || "U"} src={avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">{name || "Minha Conta"}</p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 capitalize">{planId}</p>
              </div>
            </div>
            <div className="py-1">
              <Link
                href="/configuracoes"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                Configurações
              </Link>
              <button
                onClick={() => { setProfileOpen(false); startTransition(() => signOut()); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

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
        <NotificationBell />
      </div>
    </header>
  );
}
