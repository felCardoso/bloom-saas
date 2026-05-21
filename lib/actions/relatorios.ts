"use server";

import { createClient } from "@/lib/supabase/server";
import { isOrderPaid } from "@/lib/order-utils";

export type Period = "1m" | "3m" | "6m" | "1y" | "all";

export interface RelatoriosData {
  period: Period;
  totalRevenue: number;
  avgTicket: number;
  totalOrders: number;
  pendingOrders: number;
  totalClients: number;
  activeClients: number;
  prevTotalRevenue: number | null;
  prevAvgTicket: number | null;
  prevTotalOrders: number | null;
  monthlyRevenue: { month: string; revenue: number }[];
  newClientsMonthly: { month: string; count: number }[];
  categoryRevenue: { name: string; revenue: number }[];
  topClients: { id: string; name: string; total_spent: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

function getPeriodStart(period: Period): string | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "1m")
    return new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  if (period === "3m") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().split("T")[0];
  }
  if (period === "6m") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 6);
    return d.toISOString().split("T")[0];
  }
  if (period === "1y") return `${now.getFullYear()}-01-01`;
  return null;
}

function getPrevRange(
  period: Period,
): { start: string; end: string } | null {
  const now = new Date();
  if (period === "all") return null;
  if (period === "1m") {
    const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const e = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      start: s.toISOString().split("T")[0],
      end: e.toISOString().split("T")[0],
    };
  }
  if (period === "3m") {
    const e = new Date(now);
    e.setMonth(e.getMonth() - 3);
    e.setDate(e.getDate() - 1);
    const s = new Date(e);
    s.setMonth(s.getMonth() - 3);
    s.setDate(s.getDate() + 1);
    return {
      start: s.toISOString().split("T")[0],
      end: e.toISOString().split("T")[0],
    };
  }
  if (period === "6m") {
    const e = new Date(now);
    e.setMonth(e.getMonth() - 6);
    e.setDate(e.getDate() - 1);
    const s = new Date(e);
    s.setMonth(s.getMonth() - 6);
    s.setDate(s.getDate() + 1);
    return {
      start: s.toISOString().split("T")[0],
      end: e.toISOString().split("T")[0],
    };
  }
  if (period === "1y") {
    const y = now.getFullYear();
    return { start: `${y - 1}-01-01`, end: `${y - 1}-12-31` };
  }
  return null;
}

type VendaRow = {
  id: string;
  valor_total: number;
  status: string;
  data_venda: string;
  cliente_id: string;
  payment_method?: string;
  paid_at?: string | null;
  itens_venda: {
    quantidade: number;
    preco_unitario_no_momento: number;
    produtos: { categoria: string; nome: string } | null;
  }[];
};

export async function getRelatorios(
  period: Period = "all",
): Promise<RelatoriosData> {
  const supabase = await createClient();
  const start = getPeriodStart(period);
  const prevRange = getPrevRange(period);
  const maxMonths =
    period === "1m" ? 1 : period === "3m" ? 3 : period === "6m" ? 6 : 12;

  let vendasQ = supabase
    .from("vendas")
    .select(
      "id, valor_total, status, data_venda, cliente_id, payment_method, paid_at, itens_venda(quantidade, preco_unitario_no_momento, produtos(categoria, nome))",
    )
    .neq("status", "cancelado");
  if (start) vendasQ = vendasQ.gte("data_venda", start);

  const [vendasRes, clientesRes, pendingRes, prevVendasRes] =
    await Promise.all([
      vendasQ,
      supabase.from("clientes").select("id, nome, status, created_at"),
      supabase
        .from("vendas")
        .select("id", { count: "exact", head: true })
        .eq("status", "pendente"),
      prevRange
        ? supabase
            .from("vendas")
            .select("id, valor_total, status, payment_method, paid_at")
            .neq("status", "cancelado")
            .gte("data_venda", prevRange.start)
            .lte("data_venda", prevRange.end)
        : Promise.resolve({
            data: [] as {
              id: string;
              valor_total: number;
              status: string;
              payment_method?: string;
              paid_at?: string | null;
            }[],
          }),
    ]);

  const rows = (vendasRes.data ?? []) as unknown as VendaRow[];
  const clientes = clientesRes.data ?? [];
  const prevRows = (prevVendasRes.data ?? []) as {
    id: string;
    valor_total: number;
    status: string;
    payment_method?: string;
    paid_at?: string | null;
  }[];

  const paidRows = rows.filter(isOrderPaid);
  const totalRevenue = paidRows.reduce((s, v) => s + Number(v.valor_total), 0);
  const totalOrders = rows.length; // count all non-cancelled (kept the same — "pedidos" means orders, not paid orders)
  const avgTicket = paidRows.length ? totalRevenue / paidRows.length : 0;
  const totalClients = clientes.length;
  const activeClients = clientes.filter((c) => c.status === "ativa").length;

  const prevPaidRows = prevRange ? prevRows.filter(isOrderPaid) : [];
  const prevTotalRevenue = prevRange
    ? prevPaidRows.reduce((s, v) => s + Number(v.valor_total), 0)
    : null;
  const prevTotalOrders = prevRange ? prevRows.length : null;
  const prevAvgTicket =
    prevPaidRows.length > 0
      ? (prevTotalRevenue ?? 0) / prevPaidRows.length
      : null;

  // Monthly revenue (paid orders only)
  const monthlyMap: Record<string, number> = {};
  paidRows.forEach((v) => {
    const m = v.data_venda?.substring(0, 7);
    if (m) monthlyMap[m] = (monthlyMap[m] ?? 0) + Number(v.valor_total);
  });
  const monthlyRevenue = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxMonths)
    .map(([m, revenue]) => ({
      month: new Date(m + "-02").toLocaleDateString("pt-BR", {
        month: "short",
      }),
      revenue,
    }));

  // New clients monthly
  const filteredClients = start
    ? clientes.filter((c) => (c.created_at ?? "") >= start)
    : clientes;
  const newClientsMap: Record<string, number> = {};
  filteredClients.forEach((c) => {
    const m = (c.created_at ?? "").substring(0, 7);
    if (m) newClientsMap[m] = (newClientsMap[m] ?? 0) + 1;
  });
  const newClientsMonthly = Object.entries(newClientsMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-maxMonths)
    .map(([m, count]) => ({
      month: new Date(m + "-02").toLocaleDateString("pt-BR", {
        month: "short",
      }),
      count,
    }));

  // Category revenue (paid orders only)
  const catMap: Record<string, number> = {};
  paidRows.forEach((v) => {
    v.itens_venda?.forEach((item) => {
      const cat = item.produtos?.categoria ?? "Outros";
      catMap[cat] =
        (catMap[cat] ?? 0) +
        item.quantidade * Number(item.preco_unitario_no_momento);
    });
  });
  const categoryRevenue = Object.entries(catMap)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top products (paid orders only)
  const prodMap: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};
  paidRows.forEach((v) => {
    v.itens_venda?.forEach((item) => {
      const name = item.produtos?.nome ?? "Produto removido";
      if (!prodMap[name]) prodMap[name] = { name, quantity: 0, revenue: 0 };
      prodMap[name].quantity += item.quantidade;
      prodMap[name].revenue +=
        item.quantidade * Number(item.preco_unitario_no_momento);
    });
  });
  const topProducts = Object.values(prodMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Top clients (paid orders only)
  const clientRevMap: Record<string, number> = {};
  paidRows.forEach((v) => {
    clientRevMap[v.cliente_id] =
      (clientRevMap[v.cliente_id] ?? 0) + Number(v.valor_total);
  });
  const topClients = clientes
    .map((c) => ({
      id: c.id,
      name: c.nome,
      total_spent: clientRevMap[c.id] ?? 0,
    }))
    .sort((a, b) => b.total_spent - a.total_spent)
    .filter((c) => c.total_spent > 0)
    .slice(0, 5);

  return {
    period,
    totalRevenue,
    avgTicket,
    totalOrders,
    pendingOrders: pendingRes.count ?? 0,
    totalClients,
    activeClients,
    prevTotalRevenue,
    prevAvgTicket,
    prevTotalOrders,
    monthlyRevenue,
    newClientsMonthly,
    categoryRevenue,
    topClients,
    topProducts,
  };
}
