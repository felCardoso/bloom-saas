import { getProdutos } from "@/lib/actions/produtos";
import { ProdutosView } from "./view";

export default async function ProdutosPage() {
  const products = await getProdutos();
  return <ProdutosView initialProducts={products} />;
}
