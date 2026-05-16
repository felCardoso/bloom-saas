"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

type ProductRow = {
  id: string;
  nome: string;
  marca: string | null;
  categoria: string | null;
  preco_custo: number | null;
  preco_venda: number | null;
  estoque_atual: number | null;
  created_at: string;
};

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.nome,
    brand: row.marca ?? "",
    category: row.categoria ?? "",
    cost_price: Number(row.preco_custo ?? 0),
    sale_price: Number(row.preco_venda ?? 0),
    stock: row.estoque_atual ?? 0,
    created_at: row.created_at,
  };
}

export async function getProdutos(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("id, nome, marca, categoria, preco_custo, preco_venda, estoque_atual, created_at")
    .eq("ativo", true)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ProductRow[]).map(rowToProduct);
}

export async function addProduto(form: {
  name: string;
  brand: string;
  category: string;
  cost_price: string;
  sale_price: string;
  stock: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("produtos").insert({
    user_id: user.id,
    nome: form.name,
    marca: form.brand || null,
    categoria: form.category || null,
    preco_custo: Number(form.cost_price) || 0,
    preco_venda: Number(form.sale_price) || 0,
    estoque_atual: Number(form.stock) || 0,
  });

  if (error) return { error: error.message };
  revalidatePath("/produtos");
  return {};
}

export async function deleteProduto(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("produtos")
    .update({ ativo: false })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/produtos");
  return {};
}
