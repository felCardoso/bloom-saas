"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StockMovement } from "@/lib/types";

type MovRow = {
  id: string;
  produto_id: string;
  tipo: string;
  quantidade: number;
  motivo: string | null;
  venda_id: string | null;
  created_at: string;
};

export async function getMovimentacoes(produtoId: string): Promise<StockMovement[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("movimentacoes_estoque")
    .select("id, produto_id, tipo, quantidade, motivo, venda_id, created_at")
    .eq("produto_id", produtoId)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((r: MovRow) => ({
    id: r.id,
    produto_id: r.produto_id,
    tipo: r.tipo as StockMovement["tipo"],
    quantidade: r.quantidade,
    motivo: r.motivo ?? undefined,
    venda_id: r.venda_id ?? undefined,
    created_at: r.created_at,
  }));
}

export async function adicionarEstoque(
  produtoId: string,
  quantidade: number,
  motivo?: string,
): Promise<{ error?: string; newStock?: number }> {
  if (quantidade <= 0) return { error: "Quantidade deve ser maior que zero." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado." };

  const { data: produto, error: fetchErr } = await supabase
    .from("produtos")
    .select("estoque_atual")
    .eq("id", produtoId)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !produto) return { error: "Produto não encontrado." };

  const newStock = (produto.estoque_atual ?? 0) + quantidade;

  const { error: updateErr } = await supabase
    .from("produtos")
    .update({ estoque_atual: newStock })
    .eq("id", produtoId)
    .eq("user_id", user.id);

  if (updateErr) return { error: "Erro ao atualizar estoque." };

  const { error: movErr } = await supabase.from("movimentacoes_estoque").insert({
    user_id: user.id,
    produto_id: produtoId,
    tipo: "entrada",
    quantidade,
    motivo: motivo?.trim() || null,
  });
  if (movErr) return { error: "Estoque atualizado, mas falha ao registrar histórico." };

  revalidatePath("/produtos");
  return { newStock };
}
