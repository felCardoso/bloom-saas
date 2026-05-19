import { getProfile, getNotificationPrefs, getPlanPeriodEnd } from "@/lib/actions/profile";
import ConfiguracoesClient from "./_client";

export default async function ConfiguracoesPage() {
  const [initialProfile, initialNotifs, periodEnd] = await Promise.all([
    getProfile(),
    getNotificationPrefs(),
    getPlanPeriodEnd(),
  ]);

  return (
    <ConfiguracoesClient
      initialProfile={initialProfile}
      initialNotifs={initialNotifs}
      initialPeriodEnd={periodEnd}
    />
  );
}
