import { getProfile, getNotificationPrefs } from "@/lib/actions/profile";
import ConfiguracoesClient from "./_client";

export default async function ConfiguracoesPage() {
  const [initialProfile, initialNotifs] = await Promise.all([
    getProfile(),
    getNotificationPrefs(),
  ]);

  return <ConfiguracoesClient initialProfile={initialProfile} initialNotifs={initialNotifs} />;
}
