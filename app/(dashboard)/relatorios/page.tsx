import { getRelatorios } from "@/lib/actions/relatorios";
import RelatoriosClient from "./_client";

export default async function RelatoriosPage() {
  const data = await getRelatorios();
  return <RelatoriosClient data={data} />;
}
