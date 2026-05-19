"use server";

import { createClient } from "@/lib/supabase/server";
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
