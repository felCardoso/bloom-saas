"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PLANS } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";
import type { ClientStatus } from "@/lib/types";

export type ImportClienteRow = {
  name: string;
  phone: string;
  email: string;
  city: string;
  status: ClientStatus;
  notes: string;
  birthday: string;
};

export type ImportProdutoRow = {
  name: string;
  brand: string;
  category: string;
  cost_price: number;
  sale_price: number;
  stock: number;
};

async function checkPlanCsvExport(userId: string) {
  const supabase = await createClient();
  const { data: perfil } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", userId)
    .single();

  const planId = (perfil?.plano ?? "free") as PlanId;
  return PLANS[planId]?.features?.csvExport ?? false;
}

export async function importClientesCSV(
  rows: ImportClienteRow[]
): Promise<{ imported: number; skipped: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { imported: 0, skipped: 0, error: "Não autenticado" };

  const allowed = await checkPlanCsvExport(user.id);
  if (!allowed) return { imported: 0, skipped: 0, error: "Disponível apenas no plano Premium" };

  const validStatuses: ClientStatus[] = ["ativa", "inativa", "prospect"];

  const { data: perfil } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", user.id)
    .single();
  const planId = (perfil?.plano ?? "free") as PlanId;
  const limit = PLANS[planId].limits.clients;

  let rowsToInsert = rows.filter((r) => r.name.trim() !== "");
  let skipped = rows.length - rowsToInsert.length;

  if (limit !== -1) {
    const { count } = await supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    const remaining = limit - (count ?? 0);
    if (remaining <= 0) {
      return { imported: 0, skipped: rows.length, error: `Limite de ${limit} clientes atingido.` };
    }
    if (rowsToInsert.length > remaining) {
      skipped += rowsToInsert.length - remaining;
      rowsToInsert = rowsToInsert.slice(0, remaining);
    }
  }

  const insertData = rowsToInsert.map((r) => ({
    user_id: user.id,
    nome: r.name.trim(),
    telefone: r.phone.trim() || null,
    email: r.email.trim() || null,
    bairro_cidade: r.city.trim() || null,
    status: validStatuses.includes(r.status) ? r.status : "ativa",
    observacoes: r.notes.trim() || null,
    data_nascimento: r.birthday.trim() || null,
  }));

  const { error } = await supabase.from("clientes").insert(insertData);
  if (error) return { imported: 0, skipped, error: error.message };

  revalidatePath("/clientes");
  return { imported: rowsToInsert.length, skipped };
}

export async function importProdutosCSV(
  rows: ImportProdutoRow[]
): Promise<{ imported: number; skipped: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { imported: 0, skipped: 0, error: "Não autenticado" };

  const allowed = await checkPlanCsvExport(user.id);
  if (!allowed) return { imported: 0, skipped: 0, error: "Disponível apenas no plano Premium" };

  const { data: perfil } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", user.id)
    .single();
  const planId = (perfil?.plano ?? "free") as PlanId;
  const limit = PLANS[planId].limits.products;

  let rowsToInsert = rows.filter((r) => r.name.trim() !== "");
  let skipped = rows.length - rowsToInsert.length;

  if (limit !== -1) {
    const { count } = await supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("ativo", true);

    const remaining = limit - (count ?? 0);
    if (remaining <= 0) {
      return { imported: 0, skipped: rows.length, error: `Limite de ${limit} produtos atingido.` };
    }
    if (rowsToInsert.length > remaining) {
      skipped += rowsToInsert.length - remaining;
      rowsToInsert = rowsToInsert.slice(0, remaining);
    }
  }

  const insertData = rowsToInsert.map((r) => ({
    user_id: user.id,
    nome: r.name.trim(),
    marca: r.brand.trim() || null,
    categoria: r.category.trim() || null,
    preco_custo: isNaN(r.cost_price) ? 0 : r.cost_price,
    preco_venda: isNaN(r.sale_price) ? 0 : r.sale_price,
    estoque_atual: isNaN(r.stock) ? 0 : r.stock,
    ativo: true,
  }));

  const { error } = await supabase.from("produtos").insert(insertData);
  if (error) return { imported: 0, skipped, error: error.message };

  revalidatePath("/produtos");
  return { imported: rowsToInsert.length, skipped };
}
