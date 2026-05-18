"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ScheduleEvent } from "@/lib/types";

export async function getEventos(): Promise<ScheduleEvent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("eventos_agenda")
    .select("*")
    .order("date", { ascending: true });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    client_name: r.client_name,
    type: r.type as ScheduleEvent["type"],
    title: r.title,
    description: r.description ?? undefined,
    date: r.date,
    completed: r.completed,
  }));
}

export async function addEvento(form: {
  client_name: string;
  type: ScheduleEvent["type"];
  title: string;
  description: string;
  date: string;
}): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado" };

  const { error } = await supabase.from("eventos_agenda").insert({
    user_id: user.id,
    client_name: form.client_name,
    type: form.type,
    title: form.title,
    description: form.description || null,
    date: form.date,
  });
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return {};
}

export async function toggleEvento(id: string, completed: boolean): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("eventos_agenda")
    .update({ completed })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return {};
}

export async function deleteEvento(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("eventos_agenda")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return {};
}

export async function updateEvento(
  id: string,
  form: {
    client_name: string;
    type: ScheduleEvent["type"];
    title: string;
    description: string;
    date: string;
  }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("eventos_agenda")
    .update({
      client_name: form.client_name,
      type: form.type,
      title: form.title,
      description: form.description || null,
      date: form.date,
    })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/agenda");
  return {};
}
