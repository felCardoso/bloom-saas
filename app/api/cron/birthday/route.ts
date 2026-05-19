import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/push";
import type { PushPayload } from "@/lib/push";

function isCronAuthorized(req: Request): boolean {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return auth === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const mmdd = `${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

  // Find users with birthday reminders enabled
  const { data: profiles } = await supabase
    .from("perfis_usuarios")
    .select("id")
    .filter("preferencias_notificacoes->birthdays", "eq", "true");

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const profile of profiles) {
    const userId = profile.id;

    // Find clients with birthday tomorrow (MM-DD match on aniversario column)
    const { data: clients } = await supabase
      .from("clientes")
      .select("id, nome, aniversario")
      .eq("user_id", userId)
      .not("aniversario", "is", null);

    const birthdayClients = (clients ?? []).filter((c) => {
      if (!c.aniversario) return false;
      const parts = c.aniversario.split("-");
      const clientMmdd = `${parts[1]}-${parts[2]}`;
      return clientMmdd === mmdd;
    });

    if (!birthdayClients.length) continue;

    for (const client of birthdayClients) {
      const title = `🎂 Aniversário de ${client.nome}`;
      const body = `${client.nome} faz aniversário amanhã! Não esqueça de parabenizá-la.`;

      // Create in-app notification
      await supabase.from("notificacoes").insert({
        user_id: userId,
        type: "birthday",
        title,
        body,
        data: { client_id: client.id, client_name: client.nome },
      });

      sent++;
    }

    // Send push notification (one per user summarizing all birthdays)
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);

    if (!subs?.length || !birthdayClients.length) continue;

    const names = birthdayClients.map((c) => c.nome).join(", ");
    const payload: PushPayload = {
      title: "🎂 Aniversários amanhã",
      body: `${names} ${birthdayClients.length === 1 ? "faz" : "fazem"} aniversário amanhã!`,
      tag: "birthday",
      url: "/clientes",
    };

    for (const sub of subs) {
      const result = await sendPushNotification(
        sub.subscription as Parameters<typeof sendPushNotification>[0],
        payload
      );
      if (result === "expired") {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  }

  return NextResponse.json({ sent });
}
