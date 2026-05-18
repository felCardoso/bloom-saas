import { getEventos } from "@/lib/actions/agenda";
import AgendaClient from "./_client";

export default async function AgendaPage() {
  const events = await getEventos();
  return <AgendaClient initialEvents={events} />;
}
