import type { Metadata } from "next";
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

export default function SuportePage() {
  return <SuporteClient />;
}
