"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { checkPlanLimit } from "@/lib/actions/plan-limit";
import type { WhatsAppTemplate, WaTemplateType } from "@/lib/types";

type TemplateRow = {
  id: string;
  nome: string;
  tipo: string;
  mensagem: string;
  created_at: string;
};

function rowToTemplate(row: TemplateRow): WhatsAppTemplate {
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo as WaTemplateType,
    mensagem: row.mensagem,
    created_at: row.created_at,
  };
}

export async function getTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("templates_whatsapp")
    .select("id, nome, tipo, mensagem, created_at")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as TemplateRow[]).map(rowToTemplate);
}

export async function addTemplate(form: {
  nome: string;
  tipo: WaTemplateType;
  mensagem: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const limitCheck = await checkPlanLimit(
    supabase,
    user.id,
    "messageTemplates",
  );
  if (limitCheck.error) return limitCheck;

  const { error } = await supabase.from("templates_whatsapp").insert({
    user_id: user.id,
    nome: form.nome,
    tipo: form.tipo,
    mensagem: form.mensagem,
  });
  if (error) return { error: error.message };
  revalidatePath("/mensagens");
  return {};
}

export async function updateTemplate(
  id: string,
  form: { nome: string; tipo: WaTemplateType; mensagem: string },
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("templates_whatsapp")
    .update({ nome: form.nome, tipo: form.tipo, mensagem: form.mensagem })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/mensagens");
  return {};
}

export async function deleteTemplate(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("templates_whatsapp")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/mensagens");
  return {};
}
