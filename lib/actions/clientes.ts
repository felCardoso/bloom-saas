"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPlanLimit } from "@/lib/actions/plan-limit";
import type { Client, ClientStatus } from "@/lib/types";

type ClientRow = {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  bairro_cidade: string | null;
  status: string | null;
  observacoes: string | null;
  data_nascimento: string | null;
  created_at: string;
  vendas: { valor_total: number }[];
};

function rowToClient(row: ClientRow): Client {
  const total_spent = row.vendas.reduce((s, v) => s + Number(v.valor_total), 0);
  return {
    id: row.id,
    name: row.nome,
    email: row.email ?? undefined,
    phone: row.telefone ?? "",
    city: row.bairro_cidade ?? undefined,
    status: (row.status as ClientStatus) ?? "ativa",
    notes: row.observacoes ?? undefined,
    birthday: row.data_nascimento ?? undefined,
    created_at: row.created_at,
    total_orders: row.vendas.length,
    total_spent,
    last_order_date: undefined,
  };
}

export async function getClientes(): Promise<Client[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clientes")
    .select("*, vendas(valor_total)")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as ClientRow[]).map(rowToClient);
}

export async function addCliente(form: {
  name: string;
  phone: string;
  email: string;
  city: string;
  status: ClientStatus;
  notes: string;
  birthday: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const limitCheck = await checkPlanLimit(supabase, user.id, "clients");
  if (limitCheck.error) return limitCheck;

  const { error } = await supabase.from("clientes").insert({
    user_id: user.id,
    nome: form.name,
    telefone: form.phone || null,
    email: form.email || null,
    bairro_cidade: form.city || null,
    status: form.status,
    observacoes: form.notes || null,
    data_nascimento: form.birthday || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/clientes");
  return {};
}

export async function updateClienteStatus(
  id: string,
  status: ClientStatus,
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clientes");
  return {};
}

export async function deleteCliente(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("clientes").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clientes");
  return {};
}

export async function updateCliente(
  id: string,
  form: {
    name: string;
    phone: string;
    email: string;
    city: string;
    status: ClientStatus;
    notes: string;
    birthday: string;
  },
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clientes")
    .update({
      nome: form.name,
      telefone: form.phone || null,
      email: form.email || null,
      bairro_cidade: form.city || null,
      status: form.status,
      observacoes: form.notes || null,
      data_nascimento: form.birthday || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clientes");
  return {};
}
