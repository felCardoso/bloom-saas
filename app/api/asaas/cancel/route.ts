"use server";

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";
import { revalidatePath } from "next/cache";

interface AsaasSubscription {
  id: string;
  nextDueDate: string; // YYYY-MM-DD — first day of the NEXT billing cycle = end of current access
}

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

  let periodEnd: string;
  try {
    const subscription = await asaasRequest<AsaasSubscription>(
      `/subscriptions/${profile.asaas_subscription_id}`
    );
    periodEnd = subscription.nextDueDate;
  } catch {
    return NextResponse.json({ error: "Erro ao consultar assinatura" }, { status: 502 });
  }

  try {
    await asaasRequest(`/subscriptions/${profile.asaas_subscription_id}`, { method: "DELETE" });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao cancelar no Asaas";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  // Keep the current plan active — access remains until periodEnd
  await supabase
    .from("perfis_usuarios")
    .update({
      asaas_subscription_id: null,
      asaas_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");

  return NextResponse.json({ success: true, expiresAt: periodEnd });
}
