"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/plans";
import type { Usage } from "@/lib/plan-context";

export async function getUserPlan(): Promise<PlanId> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("plano")
    .eq("id", user.id)
    .single();

  const plan = data?.plano as PlanId | null;
  if (plan === "pro" || plan === "premium") return plan;
  return "free";
}

export async function getUsageCounts(): Promise<Partial<Usage>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [clientsRes, productsRes, vendasRes] = await Promise.all([
    supabase.from("clientes").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("produtos").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("ativo", true),
    supabase.from("vendas").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("data_venda", startOfMonth),
  ]);

  return {
    clients: clientsRes.count ?? 0,
    products: productsRes.count ?? 0,
    ordersPerMonth: vendasRes.count ?? 0,
    events: 0,
  };
}

export async function updatePlan(planId: PlanId) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("perfis_usuarios")
    .update({ plano: planId, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
