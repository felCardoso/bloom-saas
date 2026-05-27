"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderItem, PaymentMethod } from "@/lib/types";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { checkPlanLimit } from "@/lib/actions/plan-limit";
import { logMovimento } from "@/lib/stock-utils";

type VendaRow = {
  id: string;
  cliente_id: string;
  data_venda: string;
  valor_total: number;
  status: string;
  payment_method: string;
  paid_at: string | null;
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
    payment_method: (row.payment_method ?? "dinheiro") as PaymentMethod,
    paid_at: row.paid_at ?? undefined,
    created_at: row.data_venda ?? row.created_at,
  };
}

type StockItem = { product_id: string; quantity: number };

async function adjustStock(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: StockItem[],
  delta: 1 | -1,
  opts?: { userId?: string; motivo?: string; vendaId?: string },
): Promise<void> {
  for (const item of items) {
    const { data } = await supabase
      .from("produtos")
      .select("estoque_atual")
      .eq("id", item.product_id)
      .maybeSingle();

    if (data) {
      const newStock = Math.max(
        0,
        (data.estoque_atual ?? 0) + delta * item.quantity,
      );
      await supabase
        .from("produtos")
        .update({ estoque_atual: newStock })
        .eq("id", item.product_id);

      if (opts?.userId) {
        await logMovimento(supabase, {
          user_id: opts.userId,
          produto_id: item.product_id,
          tipo: delta === -1 ? "saida" : "entrada",
          quantidade: item.quantity,
          motivo: opts.motivo,
          venda_id: opts.vendaId,
        });
      }
    }
  }
}

async function getItensVenda(
  supabase: Awaited<ReturnType<typeof createClient>>,
  vendaId: string,
): Promise<StockItem[]> {
  const { data } = await supabase
    .from("itens_venda")
    .select("produto_id, quantidade")
    .eq("venda_id", vendaId);

  return (data ?? []).map((r: { produto_id: string; quantidade: number }) => ({
    product_id: r.produto_id,
    quantity: r.quantidade,
  }));
}

export async function getVendas(): Promise<Order[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendas")
    .select(
      "id, cliente_id, data_venda, valor_total, status, payment_method, paid_at, created_at, clientes(nome), itens_venda(quantidade, preco_unitario_no_momento, produtos(id, nome))",
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
  payment_method: PaymentMethod;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const limitCheck = await checkPlanLimit(supabase, user.id, "ordersPerMonth");
  if (limitCheck.error) return limitCheck;

  const total = form.items.reduce((s, i) => s + i.subtotal, 0);

  const { data: venda, error: vendaError } = await supabase
    .from("vendas")
    .insert({
      user_id: user.id,
      cliente_id: form.client_id,
      valor_total: total,
      status: form.status,
      payment_method: form.payment_method,
    })
    .select("id")
    .single();

  if (vendaError || !venda)
    return { error: vendaError?.message ?? "Erro ao criar pedido" };

  const itens = form.items.map((item) => ({
    venda_id: venda.id,
    produto_id: item.product_id,
    quantidade: item.quantity,
    preco_unitario_no_momento: item.unit_price,
  }));

  const { error: itensError } = await supabase
    .from("itens_venda")
    .insert(itens);
  if (itensError) return { error: itensError.message };

  if (form.status !== "cancelado") {
    await adjustStock(
      supabase,
      form.items.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      })),
      -1,
      { userId: user.id, motivo: "Pedido criado", vendaId: venda.id },
    );
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
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  return {};
}

export async function updateVendaStatus(
  id: string,
  status: OrderStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current } = await supabase
    .from("vendas")
    .select("status")
    .eq("id", id)
    .single();

  const oldStatus = current?.status as OrderStatus | undefined;

  const { error } = await supabase
    .from("vendas")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };

  if (oldStatus && oldStatus !== status) {
    const itens = await getItensVenda(supabase, id);
    if (itens.length > 0) {
      if (status === "cancelado" && oldStatus !== "cancelado") {
        await adjustStock(supabase, itens, 1, {
          userId: user?.id,
          motivo: "Pedido cancelado",
          vendaId: id,
        });
      } else if (status !== "cancelado" && oldStatus === "cancelado") {
        await adjustStock(supabase, itens, -1, {
          userId: user?.id,
          motivo: "Pedido reativado",
          vendaId: id,
        });
      }
    }
  }

  revalidatePath("/pedidos");
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  return {};
}

export async function confirmPayment(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("vendas")
    .update({ paid_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/pedidos");
  return {};
}

export async function deleteVenda(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: current } = await supabase
    .from("vendas")
    .select("status")
    .eq("id", id)
    .single();

  if (current?.status !== "cancelado") {
    const itens = await getItensVenda(supabase, id);
    if (itens.length > 0) {
      await adjustStock(supabase, itens, 1, {
        userId: user?.id,
        motivo: "Pedido excluído",
        vendaId: id,
      });
    }
  }

  const { error } = await supabase.from("vendas").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/pedidos");
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  return {};
}
