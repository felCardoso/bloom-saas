"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderItem } from "@/lib/types";
import { sendOrderConfirmationEmail } from "@/lib/email";

type VendaRow = {
  id: string;
  cliente_id: string;
  data_venda: string;
  valor_total: number;
  status: string;
  created_at: string;
  clientes: { nome: string } | null;
  itens_venda: {
    quantidade: number;
    preco_unitario_no_momento: number;
    produtos: { id: string; nome: string } | null;
  }[];
};

function rowToOrder(row: VendaRow): Order {
  const items: OrderItem[] = row.itens_venda.map((item) => ({
    product_id: item.produtos?.id ?? "",
    product_name: item.produtos?.nome ?? "Produto removido",
    quantity: item.quantidade,
    unit_price: Number(item.preco_unitario_no_momento),
    subtotal: item.quantidade * Number(item.preco_unitario_no_momento),
  }));

  return {
    id: row.id,
    client_id: row.cliente_id,
    client_name: row.clientes?.nome ?? "Cliente removido",
    items,
    total: Number(row.valor_total),
    status: row.status as OrderStatus,
    created_at: row.data_venda ?? row.created_at,
  };
}

export async function getVendas(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendas")
    .select(
      "id, cliente_id, data_venda, valor_total, status, created_at, clientes(nome), itens_venda(quantidade, preco_unitario_no_momento, produtos(id, nome))"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as unknown as VendaRow[]).map(rowToOrder);
}

export async function addVenda(form: {
  client_id: string;
  status: OrderStatus;
  notes: string;
  items: OrderItem[];
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const total = form.items.reduce((s, i) => s + i.subtotal, 0);

  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      user_id: user.id,
      cliente_id: form.client_id,
      valor_total: total,
      status: form.status,
    })
    .select("id")
    .single();

  if (vendaError || !venda) return { error: vendaError?.message ?? "Erro ao criar pedido" };

  const itens = form.items.map((item) => ({
    venda_id: venda.id,
    produto_id: item.product_id,
    quantidade: item.quantity,
    preco_unitario_no_momento: item.unit_price,
  }));

  const { error: itensError } = await supabase.from("itens_venda").insert(itens);
  if (itensError) return { error: itensError.message };

  // Decrement stock for each sold product
  const productIds = form.items.map((i) => i.product_id).filter(Boolean);
  if (productIds.length > 0) {
    const { data: produtos } = await supabase
      .from("produtos")
      .select("id, estoque_atual")
      .in("id", productIds)
      .eq("user_id", user.id);

    if (produtos?.length) {
      const stockMap = new Map(produtos.map((p) => [p.id, p.estoque_atual ?? 0]));
      await Promise.all(
        form.items
          .filter((item) => item.product_id && stockMap.has(item.product_id))
          .map((item) =>
            supabase
              .from("produtos")
              .update({
                estoque_atual: Math.max(0, (stockMap.get(item.product_id) ?? 0) - item.quantity),
              })
              .eq("id", item.product_id)
              .eq("user_id", user.id)
          )
      );
    }
  }

  const { data: authUser } = await supabase.auth.getUser();
  if (authUser.user?.email) {
    const { data: cliente } = await supabase
      .from("clientes")
      .select("nome")
      .eq("id", form.client_id)
      .single();

    void sendOrderConfirmationEmail(authUser.user.email, {
      clientName: cliente?.nome ?? "Cliente",
      orderId: venda.id,
      items: form.items.map((i) => ({
        name: i.product_name,
        quantity: i.quantity,
        unitPrice: i.unit_price,
      })),
      total,
    });
  }

  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  revalidatePath("/produtos");
  return {};
}

export async function updateVendaStatus(
  id: string,
  status: OrderStatus
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendas")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  return {};
}

export async function deleteVenda(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("vendas").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/pedidos");
  revalidatePath("/dashboard");
  return {};
}
