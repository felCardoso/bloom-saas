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

export async function getProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("nome_completo, email, telefone, nome_marca, avatar_url")
    .eq("id", user.id)
    .single();

  return {
    name: data?.nome_completo ?? "",
    email: data?.email ?? user.email ?? "",
    phone: data?.telefone ?? "",
    brand: data?.nome_marca ?? "",
    avatarUrl: (data?.avatar_url as string | null) ?? null,
  };
}

export async function updateAvatar(url: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("perfis_usuarios")
    .update({ avatar_url: url, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateProfile(profile: {
  name: string;
  email: string;
  phone: string;
  brand: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates: Record<string, unknown> = {
    nome_completo: profile.name,
    email: profile.email,
    telefone: profile.phone,
    nome_marca: profile.brand,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("perfis_usuarios")
    .update(updates)
    .eq("id", user.id);

  if (error) return { error: error.message };

  if (profile.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email: profile.email });
    if (authError) return { error: authError.message };
  }

  return { success: true };
}

export type NotificationPrefs = {
  birthdays: boolean;
  pendingOrders: boolean;
  stockAlerts: boolean;
  newsletter: boolean;
  push: boolean;
};

const DEFAULT_NOTIF_PREFS: NotificationPrefs = {
  birthdays: false,
  pendingOrders: true,
  stockAlerts: false,
  newsletter: false,
  push: false,
};

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return DEFAULT_NOTIF_PREFS;

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("preferencias_notificacoes")
    .eq("id", user.id)
    .single();

  return { ...DEFAULT_NOTIF_PREFS, ...(data?.preferencias_notificacoes ?? {}) };
}

export async function updateNotificationPrefs(prefs: NotificationPrefs) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("perfis_usuarios")
    .update({ preferencias_notificacoes: prefs, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getOnboardingStatus(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return true;

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("onboarding_completo")
    .eq("id", user.id)
    .single();

  return (data?.onboarding_completo as boolean | null) ?? false;
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("perfis_usuarios")
    .update({ onboarding_completo: true })
    .eq("id", user.id);
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
