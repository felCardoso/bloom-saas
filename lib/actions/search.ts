"use server";

import { createClient } from "@/lib/supabase/server";

export type SearchResultItem = {
  id: string;
  type: "cliente" | "produto";
  title: string;
  subtitle: string;
};

export async function searchGlobal(query: string): Promise<SearchResultItem[]> {
  if (query.trim().length < 2) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const q = `%${query.trim()}%`;

  const [clientesRes, produtosRes] = await Promise.all([
    supabase
      .from("clientes")
      .select("id, nome, telefone, status")
      .eq("user_id", user.id)
      .or(`nome.ilike.${q},telefone.ilike.${q},email.ilike.${q}`)
      .limit(5),
    supabase
      .from("produtos")
      .select("id, nome, marca, categoria, preco_venda")
      .eq("user_id", user.id)
      .eq("ativo", true)
      .or(`nome.ilike.${q},marca.ilike.${q}`)
      .limit(5),
  ]);

  const results: SearchResultItem[] = [];

  for (const c of clientesRes.data ?? []) {
    const statusLabel: Record<string, string> = {
      ativa: "Ativa",
      inativa: "Inativa",
      prospect: "Prospect",
    };
    results.push({
      id: c.id,
      type: "cliente",
      title: c.nome,
      subtitle: c.telefone ?? statusLabel[c.status ?? ""] ?? "",
    });
  }

  for (const p of produtosRes.data ?? []) {
    const parts = [p.marca ?? p.categoria ?? "", p.preco_venda != null ? `R$ ${Number(p.preco_venda).toFixed(2)}` : ""].filter(Boolean);
    results.push({
      id: p.id,
      type: "produto",
      title: p.nome,
      subtitle: parts.join(" · "),
    });
  }

  return results;
}
