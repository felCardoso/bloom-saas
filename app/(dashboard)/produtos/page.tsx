import { getProdutos } from "@/lib/actions/produtos";
import { getCategorias } from "@/lib/actions/categorias";
import { ProdutosView } from "./view";

export default async function ProdutosPage() {
  const [products, categorias] = await Promise.all([getProdutos(), getCategorias()]);
  return <ProdutosView initialProducts={products} categories={categorias.map((c) => c.nome)} />;
}
