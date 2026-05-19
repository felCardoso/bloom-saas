"use server";

import { createClient } from "@/lib/supabase/server";

export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(
  subscription: PushSubscriptionJSON
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  // Use ignoreDuplicates so the unique index handles idempotency
  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      { user_id: user.id, subscription },
      { ignoreDuplicates: true }
    );

  if (error) return { error: error.message };
  return {};
}

export async function deletePushSubscription(
  endpoint: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .contains("subscription", { endpoint });

  if (error) return { error: error.message };
  return {};
}
