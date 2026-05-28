"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Order, OrderStatus, OrderItem, PaymentMethod } from "@/lib/types";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { checkPlanLimit } from "@/lib/actions/plan-limit";
import { logMovimento } from "@/lib/stock-utils";
import { maybeNotifyLowStock } from "@/lib/notifications/low-stock";

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
        await maybeNotifyLowStock(
          supabase,
          opts.userId,
          item.product_id,
          newStock,
        );
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
  data_venda?: string;
  skip_stock?: boolean;
  paid_at?: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const today = new Date().toISOString().split("T")[0];
  const dataVenda = form.data_venda?.trim() || today;
  if (dataVenda > today) return { error: "Data da venda não pode ser futura" };
  const isRetroactive = dataVenda < today;

  const limitCheck = await checkPlanLimit(supabase, user.id, "ordersPerMonth", {
    dateOverride: dataVenda,
  });
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
      data_venda: dataVenda,
      paid_at: form.paid_at || null,
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

  if (form.status !== "cancelado" && !form.skip_stock) {
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
  if (authUser.user?.email && !isRetroactive) {
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

/**
 * Atualiza os itens de um pedido existente: adiciona, remove ou ajusta
 * quantidades, reconciliando estoque pelo delta (newQty - oldQty) de cada
 * produto. Recalcula valor_total da venda.
 *
 * Status:
 * - pendente / confirmado / entregue: ajusta estoque e itens
 * - cancelado: retorna erro (faz sentido editar só pedidos ativos)
 *
 * Falha cedo se algum delta positivo (precisa mais estoque) for maior que
 * o estoque atual disponível do produto.
 */
export async function updateVendaItems(
  vendaId: string,
  newItems: OrderItem[],
): Promise<{ error?: string }> {
  if (newItems.length === 0) {
    return { error: "Um pedido precisa ter pelo menos um item." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { data: venda, error: vendaErr } = await supabase
    .from("vendas")
    .select("id, status, user_id")
    .eq("id", vendaId)
    .single();

  if (vendaErr || !venda) return { error: "Pedido não encontrado" };
  if (venda.user_id !== user.id) return { error: "Não autorizado" };
  if (venda.status === "cancelado") {
    return {
      error: "Não é possível editar os itens de um pedido cancelado.",
    };
  }

  // Carrega itens atuais para calcular o delta por produto
  const oldItems = await getItensVenda(supabase, vendaId);

  // Mapa produto_id → delta (positivo = precisa baixar mais estoque)
  const deltas = new Map<string, number>();
  for (const oldItem of oldItems) {
    deltas.set(
      oldItem.product_id,
      (deltas.get(oldItem.product_id) ?? 0) - oldItem.quantity,
    );
  }
  for (const newItem of newItems) {
    deltas.set(
      newItem.product_id,
      (deltas.get(newItem.product_id) ?? 0) + newItem.quantity,
    );
  }

  // Valida disponibilidade pra deltas positivos antes de mexer em nada
  const positiveProductIds = Array.from(deltas.entries())
    .filter(([, d]) => d > 0)
    .map(([id]) => id);

  if (positiveProductIds.length > 0) {
    const { data: produtos } = await supabase
      .from("produtos")
      .select("id, nome, estoque_atual")
      .in("id", positiveProductIds);

    const stockMap = new Map(
      (produtos ?? []).map(
        (p: { id: string; nome: string; estoque_atual: number | null }) => [
          p.id,
          { nome: p.nome, stock: p.estoque_atual ?? 0 },
        ],
      ),
    );

    for (const productId of positiveProductIds) {
      const delta = deltas.get(productId)!;
      const info = stockMap.get(productId);
      if (!info) return { error: "Produto não encontrado." };
      if (delta > info.stock) {
        return {
          error: `Estoque insuficiente para ${info.nome}: precisa de ${delta} a mais, disponível ${info.stock}.`,
        };
      }
    }
  }

  // Substitui todos os itens da venda — mais simples e idempotente que diff
  // row-by-row. RLS + FK garantem isolamento por usuário.
  const { error: delErr } = await supabase
    .from("itens_venda")
    .delete()
    .eq("venda_id", vendaId);
  if (delErr) return { error: delErr.message };

  const newRows = newItems.map((item) => ({
    venda_id: vendaId,
    produto_id: item.product_id,
    quantidade: item.quantity,
    preco_unitario_no_momento: item.unit_price,
  }));
  const { error: insErr } = await supabase.from("itens_venda").insert(newRows);
  if (insErr) return { error: insErr.message };

  // Aplica delta de estoque + log + notificação por produto afetado
  for (const [productId, delta] of deltas) {
    if (delta === 0) continue;

    const { data: produto } = await supabase
      .from("produtos")
      .select("estoque_atual")
      .eq("id", productId)
      .maybeSingle();
    if (!produto) continue;

    const currentStock = produto.estoque_atual ?? 0;
    const newStock = Math.max(0, currentStock - delta);

    await supabase
      .from("produtos")
      .update({ estoque_atual: newStock })
      .eq("id", productId);

    await logMovimento(supabase, {
      user_id: user.id,
      produto_id: productId,
      tipo: delta > 0 ? "saida" : "entrada",
      quantidade: Math.abs(delta),
      motivo: delta > 0 ? "Pedido editado (item adicionado)" : "Pedido editado (item removido)",
      venda_id: vendaId,
    });

    await maybeNotifyLowStock(supabase, user.id, productId, newStock);
  }

  // Recalcula valor_total
  const newTotal = newItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  const { error: updErr } = await supabase
    .from("vendas")
    .update({ valor_total: newTotal })
    .eq("id", vendaId);
  if (updErr) return { error: updErr.message };

  revalidatePath("/pedidos");
  revalidatePath("/produtos");
  revalidatePath("/dashboard");
  return {};
}
