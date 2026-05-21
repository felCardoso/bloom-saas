"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendFeedbackNotificationEmail } from "@/lib/email";

export type FeedbackType = "bug" | "melhoria" | "elogio" | "outro";

export interface FeedbackItem {
  id: string;
  type: FeedbackType;
  subject: string;
  body: string;
  created_at: string;
}

export async function submitFeedback(data: {
  type: FeedbackType;
  subject: string;
  body: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  if (!data.subject.trim()) return { error: "O assunto é obrigatório." };
  if (!data.body.trim()) return { error: "A mensagem é obrigatória." };
  if (data.body.length > 2000) return { error: "A mensagem deve ter no máximo 2000 caracteres." };

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    type: data.type,
    subject: data.subject.trim(),
    body: data.body.trim(),
  });

  if (error) return { error: error.message };

  const userEmail = user.email ?? "";
  await sendFeedbackNotificationEmail(userEmail, data).catch(() => {});

  revalidatePath("/feedback");
  return {};
}

export async function getFeedbacks(): Promise<FeedbackItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("feedback")
    .select("id, type, subject, body, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (data ?? []) as FeedbackItem[];
}
