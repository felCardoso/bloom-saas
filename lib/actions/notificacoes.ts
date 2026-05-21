"use server";

import { createClient } from "@/lib/supabase/server";

export type Notificacao = {
  id: string;
  type: "birthday" | "low_stock" | "pending_order";
  title: string;
  body: string;
  read: boolean;
  data: Record<string, unknown> | null;
  created_at: string;
};

export async function getNotificacoes(): Promise<Notificacao[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("notificacoes")
    .select("id, type, title, body, read, data, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return (data ?? []) as Notificacao[];
}

export async function markAsRead(id: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("notificacoes").update({ read: true }).eq("id", id);
}

export async function markAllAsRead(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase
    .from("notificacoes")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);
}
