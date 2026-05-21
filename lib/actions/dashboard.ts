"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  Order,
  OrderStatus,
  PaymentMethod,
} from "@/lib/types";
import { isOrderPaid } from "@/lib/order-utils";

interface ClienteDB {
  id: string;
  status: string;
}

interface VendaDB {
  id: string;
  valor_total: number | string;
  status: OrderStatus;
  data_venda: string;
  payment_method?: PaymentMethod;
  paid_at?: string | null;
  cliente_id?: string;
  created_at?: string;
  clientes?: {
    nome: string;
  } | null;
  itens_venda?:
    | {
        quantidade: number;
        preco_unitario_no_momento: number | string;
        produtos?: {
          id?: string;
          nome: string;
        } | null;
      }[]
    | null;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    1,
  ).toISOString();
  const startOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).toISOString();
  const endOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth(),
    0,
    23,
    59,
    59,
  ).toISOString();

  const [clientesRes, vendasRes, vendasMesRes, vendasMesAnteriorRes] =
    await Promise.all([
      supabase.from("clientes").select("id, status"),
      supabase
        .from("vendas")
        .select(
          "id, valor_total, status, data_venda, payment_method, paid_at, itens_venda(quantidade, preco_unitario_no_momento, produtos(nome))",
        )
        .neq("status", "cancelado"),
      supabase
        .from("vendas")
        .select("valor_total, status, payment_method, paid_at")
        .gte("data_venda", startOfMonth)
        .neq("status", "cancelado"),
      supabase
        .from("vendas")
        .select("valor_total, status, payment_method, paid_at")
        .gte("data_venda", startOfPrevMonth)
        .lte("data_venda", endOfPrevMonth)
        .neq("status", "cancelado"),
    ]);

  const clientes = (clientesRes.data as ClienteDB[]) ?? [];
  const vendas = (vendasRes.data as unknown as VendaDB[]) ?? [];
  const vendasMes = (vendasMesRes.data as VendaDB[]) ?? [];
  const vendasMesAnterior = (vendasMesAnteriorRes.data as VendaDB[]) ?? [];

  const revenue_month = vendasMes
    .filter((v) => isOrderPaid(v))
    .reduce((s, v) => s + Number(v.valor_total), 0);

  const revenue_prev_month = vendasMesAnterior
    .filter((v) => isOrderPaid(v))
    .reduce((s, v) => s + Number(v.valor_total), 0);

  const pending_orders = vendas.filter((v) => v.status === "pendente").length;

  // Top products (paid orders only)
  const paidVendas = vendas.filter((v) => isOrderPaid(v));
  const productRevenue: Record<
    string,
    { name: string; quantity: number; revenue: number }
  > = {};

  for (const venda of paidVendas) {
    for (const item of venda.itens_venda ?? []) {
      const nome = item.produtos?.nome ?? "Produto";
      if (!productRevenue[nome]) {
        productRevenue[nome] = { name: nome, quantity: 0, revenue: 0 };
      }
      productRevenue[nome].quantity += item.quantidade;
      productRevenue[nome].revenue +=
        item.quantidade * Number(item.preco_unitario_no_momento);
    }
  }

  const top_products = Object.values(productRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Monthly revenue — last 6 months (paid orders only)
  const months: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const end = new Date(
      d.getFullYear(),
      d.getMonth() + 1,
      0,
      23,
      59,
      59,
    ).toISOString();
    const label = d.toLocaleDateString("pt-BR", { month: "short" });

    const rev = vendas
      .filter(
        (v) => v.data_venda >= start && v.data_venda <= end && isOrderPaid(v),
      )
      .reduce((s, v) => s + Number(v.valor_total), 0);

    months.push({ month: label.replace(".", ""), revenue: rev });
  }

  return {
    total_clients: clientes.length,
    active_clients: clientes.filter((c) => c.status === "ativa").length,
    total_orders: vendas.length,
    revenue_month,
    revenue_prev_month,
    pending_orders,
    top_products,
    monthly_revenue: months,
  };
}

export async function getRecentVendas(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendas")
    .select(
      "id, cliente_id, data_venda, valor_total, status, created_at, clientes(nome), itens_venda(quantidade, preco_unitario_no_momento, produtos(id, nome))",
    )
    .order("created_at", { ascending: false })
    .limit(4);

  if (error || !data) return [];

  const rows = data as unknown as VendaDB[];

  return rows.map((row) => ({
    id: row.id,
    client_id: row.cliente_id ?? "",
    client_name: row.clientes?.nome ?? "Cliente removido",
    items: (row.itens_venda ?? []).map((item) => ({
      product_id: item.produtos?.id ?? "",
      product_name: item.produtos?.nome ?? "Produto removido",
      quantity: item.quantidade,
      unit_price: Number(item.preco_unitario_no_momento),
      subtotal: item.quantidade * Number(item.preco_unitario_no_momento),
    })),
    total: Number(row.valor_total),
    status: row.status,
    payment_method: row.payment_method ?? "dinheiro",
    created_at: row.data_venda ?? row.created_at ?? "",
  }));
}
