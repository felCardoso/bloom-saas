"use server";

import { createHash } from "crypto";
import { redirect } from "next/navigation";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";

function hashValue(s: string): string {
  return createHash("sha256").update(s.toLowerCase().trim()).digest("hex");
}

export async function deleteAccount(confirmEmail: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  if (!user.email || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    return { error: "O e-mail digitado não confere com o da conta." };
  }

  // Cancel Asaas subscription if active — best-effort, don't block deletion on it
  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id, trial_claimed, cpf_cnpj")
    .eq("id", user.id)
    .single();

  if (profile?.asaas_subscription_id) {
    await asaasRequest(`/subscriptions/${profile.asaas_subscription_id}`, { method: "DELETE" })
      .catch(() => null);
  }

  // Record trial usage before hard-delete so it survives the cascade
  if (profile?.trial_claimed && user.email) {
    const admin = createServiceClient();
    const cpfRaw = (profile.cpf_cnpj as string | null)?.replace(/\D/g, "") ?? null;
    await admin.from("trial_blocklist").upsert(
      { email_hash: hashValue(user.email), cpf_hash: cpfRaw ? hashValue(cpfRaw) : null },
      { onConflict: "email_hash" },
    );
  }

  // Delete from auth — cascades to perfis_usuarios and all user data via FK CASCADE
  const admin = createServiceClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: error.message };

  await supabase.auth.signOut();
  redirect("/login?deleted=1");
}
