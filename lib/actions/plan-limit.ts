"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { PLANS, RESOURCE_LABELS } from "@/lib/plans";
import type { PlanId } from "@/lib/plans";

type LimitResource =
  | "clients"
  | "products"
  | "ordersPerMonth"
  | "events"
  | "messageTemplates";

export async function checkPlanLimit(
  supabase: SupabaseClient,
  userId: string,
  resource: LimitResource,
): Promise<{ error?: string }> {
  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", userId)
    .single();

  const planId: PlanId = (profile?.plano as PlanId | null) ?? "free";
  const limit = PLANS[planId].limits[resource];

  if (limit === -1) return {}; // unlimited

  let count = 0;

  if (resource === "clients") {
    const { count: c } = await supabase
      .from("clientes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    count = c ?? 0;
  } else if (resource === "products") {
    const { count: c } = await supabase
      .from("produtos")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("ativo", true);
    count = c ?? 0;
  } else if (resource === "ordersPerMonth") {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const { count: c } = await supabase
      .from("vendas")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("data_venda", startOfMonth.toISOString().split("T")[0]);
    count = c ?? 0;
  } else if (resource === "messageTemplates") {
    const { count: c } = await supabase
      .from("templates_whatsapp")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    count = c ?? 0;
  } else {
    const { count: c } = await supabase
      .from("eventos_agenda")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    count = c ?? 0;
  }

  if (count >= limit) {
    const planName = PLANS[planId].name;
    const label = RESOURCE_LABELS[resource];
    return {
      error: `Limite do plano ${planName} atingido (${limit} ${label}). Faça upgrade para continuar adicionando.`,
    };
  }

  return {};
}
