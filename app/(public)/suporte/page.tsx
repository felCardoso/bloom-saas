import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import SuporteClient from "./_client";

export const metadata: Metadata = {
  title: "Suporte",
  description:
    "Central de suporte do Bloom: FAQ, canais de atendimento e tempo de resposta por plano.",
  openGraph: {
    title: "Suporte — Bloom",
    description: "Encontre respostas rápidas ou fale com nossa equipe.",
  },
};

async function isUserPremium(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("perfis_usuarios")
      .select("plano")
      .eq("id", user.id)
      .single();
    return data?.plano === "premium";
  } catch {
    return false;
  }
}

export default async function SuportePage() {
  const isPremium = await isUserPremium();
  return <SuporteClient isPremium={isPremium} />;
}
