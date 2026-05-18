"use server";

import { createClient } from "@/lib/supabase/server";

export interface RelatoriosData {
  totalRevenue: number;
  avgTicket: number;
  totalClients: number;
  activeClients: number;
  monthlyRevenue: { month: string; revenue: number }[];
  categoryRevenue: { name: string; revenue: number }[];
  topClients: { id: string; name: string; total_spent: number }[];
}

type VendaRow = {
  id: string;
  valor_total: number;
  status: string;
  data_venda: string;
  cliente_id: string;
  itens_venda: { quantidade: number; preco_unitario_no_momento: number; produtos: { categoria: string } | null }[];
};

export async function getRelatorios(): Promise<RelatoriosData> {
  const supabase = await createClient();

  const [{ data: vendas }, { data: clientes }] = await Promise.all([
    supabase
      .from("vendas")
      .select("id, valor_total, status, data_venda, cliente_id, itens_venda(quantidade, preco_unitario_no_momento, produtos(categoria))")
      .neq("status", "cancelado"),
    supabase.from("clientes").select("id, nome, status"),
  ]);

  const rows = (vendas ?? []) as unknown as VendaRow[];

  const totalRevenue = rows.reduce((s, v) => s + Number(v.valor_total), 0);
  const avgTicket = rows.length ? totalRevenue / rows.length : 0;
  const totalClients = clientes?.length ?? 0;
  const activeClients = clientes?.filter((c) => c.status === "ativa").length ?? 0;

  // Monthly revenue – last 12 months
  const monthlyMap: Record<string, number> = {};
  rows.forEach((v) => {
    const month = v.data_venda?.substring(0, 7);
    if (month) monthlyMap[month] = (monthlyMap[month] ?? 0) + Number(v.valor_total);
  });
  const monthlyRevenue = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, revenue]) => ({
      month: new Date(month + "-02").toLocaleDateString("pt-BR", { month: "short" }),
      revenue,
    }));

  // Category revenue
  const catMap: Record<string, number> = {};
  rows.forEach((v) => {
    v.itens_venda?.forEach((item) => {
      const cat = item.produtos?.categoria ?? "Outros";
      catMap[cat] = (catMap[cat] ?? 0) + item.quantidade * Number(item.preco_unitario_no_momento);
    });
  });
  const categoryRevenue = Object.entries(catMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top clients by revenue
  const clientRevMap: Record<string, number> = {};
  rows.forEach((v) => {
    clientRevMap[v.cliente_id] = (clientRevMap[v.cliente_id] ?? 0) + Number(v.valor_total);
  });
  const topClients = (clientes ?? [])
    .map((c) => ({ id: c.id, name: c.nome, total_spent: clientRevMap[c.id] ?? 0 }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .filter((c) => c.total_spent > 0)
    .slice(0, 5);

  return { totalRevenue, avgTicket, totalClients, activeClients, monthlyRevenue, categoryRevenue, topClients };
}
