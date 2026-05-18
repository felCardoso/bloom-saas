"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: { email: string; password: string }) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(formData);
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signUp(formData: {
  name: string;
  email: string;
  password: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: { data: { nome_completo: formData.name } },
  });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resetPassword(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/recuperar-senha/confirmar`,
  });
  if (error) return { error: error.message };
  return { success: true };
}
