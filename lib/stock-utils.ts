import type { SupabaseClient } from "@supabase/supabase-js";

type MovimentoData = {
  user_id: string;
  produto_id: string;
  tipo: "entrada" | "saida" | "ajuste";
  quantidade: number;
  motivo?: string;
  venda_id?: string;
};

export async function logMovimento(
  supabase: SupabaseClient,
  data: MovimentoData,
): Promise<void> {
  await supabase.from("movimentacoes_estoque").insert(data);
}
