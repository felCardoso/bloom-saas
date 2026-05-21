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
    .select("plano, asaas_period_end, trial_ends_at, pending_plan")
    .eq("id", user.id)
    .single();

  const plan = data?.plano as PlanId | null;

  if (plan === "pro" || plan === "premium") {
    const periodEnd = data?.asaas_period_end as string | null;
    const pendingPlan = data?.pending_plan as PlanId | null;
    if (periodEnd) {
      const expired = new Date(periodEnd) <= new Date();
      if (expired) {
        const next: PlanId = pendingPlan ?? "free";
        const patch: Record<string, unknown> = {
          plano: next,
          asaas_period_end: null,
          pending_plan: null,
          updated_at: new Date().toISOString(),
        };
        if (next === "free") patch.asaas_subscription_id = null;
        await supabase.from("perfis_usuarios").update(patch).eq("id", user.id);
        return next;
      }
    }
    return plan;
  }

  // Check active trial for free-plan users
  const trialEndsAt = data?.trial_ends_at as string | null;
  if (trialEndsAt) {
    if (new Date(trialEndsAt) > new Date()) return "pro";
    // Lazy clear of expired trial
    await supabase
      .from("perfis_usuarios")
      .update({ trial_ends_at: null, updated_at: new Date().toISOString() })
      .eq("id", user.id);
  }

  return "free";
}

export async function getTrialInfo(): Promise<{ daysLeft: number | null; claimed: boolean }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { daysLeft: null, claimed: false };

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("trial_ends_at, trial_claimed, plano")
    .eq("id", user.id)
    .single();

  const claimed = !!(data?.trial_claimed);
  const trialEndsAt = data?.trial_ends_at as string | null;
  if (!trialEndsAt) return { daysLeft: null, claimed };

  const daysLeft = Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return { daysLeft: daysLeft > 0 ? daysLeft : null, claimed };
}

export async function startTrial(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autorizado" };

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("plano, trial_claimed")
    .eq("id", user.id)
    .single();

  if (data?.trial_claimed) return { error: "Você já utilizou o período de trial." };
  if (data?.plano === "pro" || data?.plano === "premium") return { error: "Você já possui um plano ativo." };

  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);

  const { error } = await supabase
    .from("perfis_usuarios")
    .update({ trial_ends_at: trialEnd.toISOString(), trial_claimed: true, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) return { error: error.message };
  return {};
}

export async function getPlanPeriodEnd(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("asaas_period_end")
    .eq("id", user.id)
    .single();

  const periodEnd = data?.asaas_period_end as string | null;
  if (!periodEnd) return null;
  // Return null if already expired (plan was just downgraded by getUserPlan)
  return new Date(periodEnd) > new Date() ? periodEnd : null;
}

export async function getPendingDowngrade(): Promise<{
  pendingPlan: PlanId | null;
  scheduledFor: string | null;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { pendingPlan: null, scheduledFor: null };

  const { data } = await supabase
    .from("perfis_usuarios")
    .select("pending_plan, asaas_period_end")
    .eq("id", user.id)
    .single();

  const pending = data?.pending_plan as PlanId | null;
  const periodEnd = data?.asaas_period_end as string | null;
  if (!pending || !periodEnd) return { pendingPlan: null, scheduledFor: null };
  if (new Date(periodEnd) <= new Date()) return { pendingPlan: null, scheduledFor: null };
  return { pendingPlan: pending, scheduledFor: periodEnd };
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
    .select("nome_completo, email, telefone, nome_marca, avatar_url, cpf_cnpj")
    .eq("id", user.id)
    .single();

  return {
    name: data?.nome_completo ?? "",
    email: data?.email ?? user.email ?? "",
    phone: data?.telefone ?? "",
    brand: data?.nome_marca ?? "",
    avatarUrl: (data?.avatar_url as string | null) ?? null,
    cpfCnpj: (data?.cpf_cnpj as string | null) ?? "",
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
  cpfCnpj?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const updates: Record<string, unknown> = {
    nome_completo: profile.name,
    email: profile.email,
    telefone: profile.phone,
    nome_marca: profile.brand,
    cpf_cnpj: profile.cpfCnpj ?? null,
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
