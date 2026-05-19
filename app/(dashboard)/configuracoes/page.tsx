import { getProfile, getNotificationPrefs, getPlanPeriodEnd } from "@/lib/actions/profile";
import { getCategorias } from "@/lib/actions/categorias";
import ConfiguracoesClient from "./_client";

export default async function ConfiguracoesPage() {
  const [initialProfile, initialNotifs, periodEnd, initialCategorias] = await Promise.all([
    getProfile(),
    getNotificationPrefs(),
    getPlanPeriodEnd(),
    getCategorias(),
  ]);

  return (
    <ConfiguracoesClient
      initialProfile={initialProfile}
      initialNotifs={initialNotifs}
      initialPeriodEnd={periodEnd}
      initialCategorias={initialCategorias}
    />
  );
}
