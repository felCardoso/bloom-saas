"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";
import { useProfile } from "@/lib/profile-context";
import { Avatar } from "@/components/ui/Avatar";
import { signOut } from "@/lib/actions/auth";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/produtos", icon: Package, label: "Produtos" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
  { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { href: "/pricing", icon: Zap, label: "Planos" },
];

const PLAN_COLORS: Record<string, string> = {
  free: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  pro: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  premium:
    "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
};

export function Sidebar() {
  const pathname = usePathname();
  const { planId, plan, usage, usagePercent } = usePlan();
  const { name, avatarUrl } = useProfile();
  const [, startTransition] = useTransition();

  // const isFreePlan = planId === "free";
  const clientPct = usagePercent("clients");

  return (
    <aside className="hidden lg:flex w-60 h-screen bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 flex-col fixed left-0 top-0 z-30">
      {/* Logo → /dashboard */}
      <div className="px-5 py-5 border-b border-neutral-100 dark:border-neutral-800">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100 tracking-tight">
              Bloom
            </span>
          </div>
          <span
            className={cn(
              "ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full",
              PLAN_COLORS[planId],
            )}
          >
            {plan.name}
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-700 dark:hover:text-neutral-200",
              )}
            >
              <Icon
                className={cn(
                  "shrink-0",
                  active
                    ? "text-rose-500 dark:text-rose-400"
                    : "text-neutral-400 dark:text-neutral-500",
                )}
                size={18}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
        <Link
          href="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/configuracoes"
              ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
              : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-700 dark:hover:text-neutral-200",
          )}
        >
          <Settings
            size={18}
            className="text-neutral-400 dark:text-neutral-500"
          />
          Configurações
        </Link>

        {/* Usage bar (free & pro only) */}
        {clientPct !== null && (
          <div className="px-3 pt-2 pb-1">
            <div className="flex justify-between text-[11px] text-neutral-400 dark:text-neutral-500 mb-1">
              <span>Clientes</span>
              <span>
                {usage.clients} / {plan.limits.clients}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  clientPct >= 100
                    ? "bg-red-400"
                    : clientPct >= 80
                      ? "bg-amber-400"
                      : "bg-rose-400",
                )}
                style={{ width: `${Math.min(clientPct, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* User card + logout */}
        <Link
          href="/configuracoes"
          className="mt-1 px-3 py-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl flex items-center gap-2.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors group"
        >
          <Avatar name={name || "U"} src={avatarUrl} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 truncate">
              {name || "Minha Conta"}
            </p>
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
              Plano {plan.name}
            </p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); startTransition(() => signOut()); }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Sair"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>
    </aside>
  );
}
