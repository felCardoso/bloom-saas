"use client";

import { Bell, Search } from "lucide-react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do seu negócio" },
  "/clientes": { title: "Clientes", subtitle: "Gerencie sua carteira de clientes" },
  "/pedidos": { title: "Pedidos", subtitle: "Controle seus pedidos e vendas" },
  "/produtos": { title: "Produtos", subtitle: "Catálogo e estoque" },
  "/agenda": { title: "Agenda", subtitle: "Follow-ups e lembretes" },
  "/relatorios": { title: "Relatórios", subtitle: "Análise de desempenho" },
  "/configuracoes": { title: "Configurações", subtitle: "Preferências da conta" },
};

export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "RoséCRM", subtitle: "" };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center px-6 gap-4 sticky top-0 z-20">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-neutral-800">{page.title}</h1>
        <p className="text-xs text-neutral-400">{page.subtitle}</p>
      </div>

      {/* Search */}
      <div className="relative hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Buscar cliente, pedido..."
          className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-56 transition-all"
        />
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-xl text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700 transition-colors">
        <Bell className="w-4.5 h-4.5" size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
      </button>
    </header>
  );
}
