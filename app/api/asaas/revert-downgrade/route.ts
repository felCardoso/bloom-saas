import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest, PLAN_TO_VALUE, PLAN_DESCRIPTIONS } from "@/lib/asaas";
import { revalidatePath } from "next/cache";
import type { PlanId } from "@/lib/plans";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id, plano, pending_plan")
    .eq("id", user.id)
    .single();

  if (!profile?.pending_plan) {
    return NextResponse.json({ error: "Nenhum downgrade agendado" }, { status: 400 });
  }
  if (!profile.asaas_subscription_id) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  const currentPlan = profile.plano as PlanId;
  const value = PLAN_TO_VALUE[currentPlan];
  if (!value) {
    return NextResponse.json({ error: "Plano atual inválido" }, { status: 400 });
  }

  try {
    await asaasRequest(`/subscriptions/${profile.asaas_subscription_id}`, {
      method: "PUT",
      body: JSON.stringify({
        value,
        description: PLAN_DESCRIPTIONS[currentPlan],
        externalReference: `${user.id}:${currentPlan}`,
      }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao reverter no Asaas";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  await supabase
    .from("perfis_usuarios")
    .update({
      pending_plan: null,
      asaas_period_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/configuracoes");
  revalidatePath("/pricing");
  revalidatePath("/dashboard");

  return NextResponse.json({ success: true });
}
