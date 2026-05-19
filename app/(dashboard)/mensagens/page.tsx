import type { Metadata } from "next";
import { getTemplates } from "@/lib/actions/mensagens";
import { getClientes } from "@/lib/actions/clientes";
import { getVendas } from "@/lib/actions/vendas";
import MensagensClient from "./_client";

export const metadata: Metadata = {
  title: "Mensagens",
};

export default async function MensagensPage() {
  const [templates, clients, orders] = await Promise.all([
    getTemplates(),
    getClientes(),
    getVendas(),
  ]);

  return (
    <MensagensClient
      initialTemplates={templates}
      initialClients={clients}
      initialOrders={orders}
    />
  );
}
