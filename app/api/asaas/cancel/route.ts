"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";
import { revalidatePath } from "next/cache";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id, plano")
    .eq("id", user.id)
    .single();

  if (!profile?.asaas_subscription_id) {
    return NextResponse.json({ error: "Nenhuma assinatura ativa encontrada" }, { status: 400 });
  }

  try {
    await asaasRequest(`/subscriptions/${profile.asaas_subscription_id}`, { method: "DELETE" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao cancelar no Asaas";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  await supabase
    .from("perfis_usuarios")
    .update({ plano: "free", asaas_subscription_id: null })
    .eq("id", user.id);

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");

  return NextResponse.json({ success: true });
}
