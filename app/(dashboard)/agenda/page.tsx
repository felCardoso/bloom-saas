import { getEventos } from "@/lib/actions/agenda";
import { getClientes } from "@/lib/actions/clientes";
import AgendaClient from "./_client";

export default async function AgendaPage() {
  const [events, clients] = await Promise.all([getEventos(), getClientes()]);
  return <AgendaClient initialEvents={events} clients={clients} />;
}
