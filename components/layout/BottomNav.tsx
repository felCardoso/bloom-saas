"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingBag, Calendar,
  MoreHorizontal, Package, BarChart3, Settings, X, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { usePlan } from "@/lib/plan-context";

const mainItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
];

const moreItems = [
  { href: "/produtos", icon: Package, label: "Produtos" },
  { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
  { href: "/pricing", icon: Zap, label: "Planos" },
  { href: "/configuracoes", icon: Settings, label: "Config." },
];

export function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const { planId } = usePlan();

  const isMoreActive = moreItems.some(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/")
  );

  return (
    <>
      {/* More drawer overlay */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      <div
        className={cn(
          "fixed bottom-16 left-0 right-0 z-50 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 lg:hidden transition-all duration-300",
          moreOpen ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 dark:border-neutral-800">
          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Menu</span>
          <button
            onClick={() => setMoreOpen(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 p-4">
          {moreItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMoreOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 px-3 py-4 rounded-2xl transition-all",
                  active
                    ? "bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}
              >
                <Icon className={cn("w-6 h-6", active ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500")} />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 safe-bottom lg:hidden">
        <div className="flex items-center h-16">
          {mainItems.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 transition-all",
                  active ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600"
                )}
              >
                <div className={cn(
                  "w-10 h-6 flex items-center justify-center rounded-full transition-all",
                  active ? "bg-rose-100 dark:bg-rose-900/40" : ""
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  active ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500"
                )}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen((v) => !v)}
            className={cn(
              "flex-1 flex flex-col items-center gap-1 py-2 transition-all",
              isMoreActive ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-600"
            )}
          >
            <div className={cn(
              "w-10 h-6 flex items-center justify-center rounded-full transition-all",
              isMoreActive || moreOpen ? "bg-rose-100 dark:bg-rose-900/40" : ""
            )}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className={cn(
              "text-[10px] font-medium",
              isMoreActive ? "text-rose-500 dark:text-rose-400" : "text-neutral-400 dark:text-neutral-500"
            )}>
              Mais
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
