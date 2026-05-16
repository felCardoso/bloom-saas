"use server";

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
