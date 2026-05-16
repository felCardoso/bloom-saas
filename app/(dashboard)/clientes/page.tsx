import { getClientes } from "@/lib/actions/clientes";
import { ClientesView } from "./view";

export default async function ClientesPage() {
  const clients = await getClientes();
  return <ClientesView initialClients={clients} />;
}
