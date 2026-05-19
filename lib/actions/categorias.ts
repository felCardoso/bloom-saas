"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_CATEGORIES = ["Maquiagem", "Skincare", "Perfumaria", "Cabelos", "Corpo"];

export interface Categoria {
  id: string;
  nome: string;
  created_at: string;
}

type CatRow = { id: string; nome: string; created_at: string };

export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let { data } = await supabase
    .from("categorias_produto")
    .select("id, nome, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (!data || data.length === 0) {
    const inserts = DEFAULT_CATEGORIES.map((nome) => ({ user_id: user.id, nome }));
    const { data: seeded } = await supabase
      .from("categorias_produto")
      .insert(inserts)
      .select("id, nome, created_at");
    data = seeded ?? [];
  }

  return (data as CatRow[]).map((r) => ({
    id: r.id,
    nome: r.nome,
    created_at: r.created_at,
  }));
}

export async function addCategoria(nome: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("categorias_produto")
    .insert({ user_id: user.id, nome: nome.trim() });

  if (error) {
    if (error.code === "23505") return { error: "Essa categoria já existe." };
    return { error: error.message };
  }
  revalidatePath("/produtos");
  revalidatePath("/configuracoes");
  return {};
}

export async function deleteCategoria(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias_produto")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/produtos");
  revalidatePath("/configuracoes");
  return {};
}

export async function renameCategoria(
  id: string,
  nome: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categorias_produto")
    .update({ nome: nome.trim() })
    .eq("id", id);
  if (error) {
    if (error.code === "23505") return { error: "Essa categoria já existe." };
    return { error: error.message };
  }
  revalidatePath("/produtos");
  revalidatePath("/configuracoes");
  return {};
}
