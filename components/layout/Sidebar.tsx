"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  BarChart3,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/pedidos", icon: ShoppingBag, label: "Pedidos" },
  { href: "/produtos", icon: Package, label: "Produtos" },
  { href: "/agenda", icon: Calendar, label: "Agenda" },
  { href: "/relatorios", icon: BarChart3, label: "Relatórios" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-60 h-screen bg-white border-r border-neutral-200 flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-neutral-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-neutral-800 tracking-tight">Rosé</span>
            <span className="text-sm font-bold text-rose-500 tracking-tight">CRM</span>
          </div>
        </div>
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
                  ? "bg-rose-50 text-rose-600"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
              )}
            >
              <Icon
                className={cn("flex-shrink-0", active ? "text-rose-500" : "text-neutral-400")}
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
      <div className="px-3 py-4 border-t border-neutral-100">
        <Link
          href="/configuracoes"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
            pathname === "/configuracoes"
              ? "bg-rose-50 text-rose-600"
              : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
          )}
        >
          <Settings size={18} className="text-neutral-400" />
          Configurações
        </Link>

        <div className="mt-3 px-3 py-3 bg-neutral-50 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-semibold text-rose-600">AC</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-neutral-700 truncate">Ana Consultora</p>
              <p className="text-[10px] text-neutral-400">Plano Pro</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
