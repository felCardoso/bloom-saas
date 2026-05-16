import { getVendas } from "@/lib/actions/vendas";
import { getClientes } from "@/lib/actions/clientes";
import { getProdutos } from "@/lib/actions/produtos";
import { PedidosView } from "./view";

export default async function PedidosPage() {
  const [orders, clients, products] = await Promise.all([
    getVendas(),
    getClientes(),
    getProdutos(),
  ]);
  return <PedidosView initialOrders={orders} clients={clients} products={products} />;
}
