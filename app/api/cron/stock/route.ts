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

  const { data: profiles } = await supabase
    .from("perfis_usuarios")
    .select("id")
    .filter("preferencias_notificacoes->stockAlerts", "eq", "true");

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const profile of profiles) {
    const userId = profile.id;

    const { data: lowStock } = await supabase
      .from("produtos")
      .select("id, nome, estoque_atual")
      .eq("user_id", userId)
      .eq("ativo", true)
      .lte("estoque_atual", 5)
      .gt("estoque_atual", 0);

    if (!lowStock?.length) continue;

    const today = new Date().toISOString().slice(0, 10);
    const { count: existing } = await supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "low_stock")
      .gte("created_at", `${today}T00:00:00Z`);

    if (existing) continue;

    const names = lowStock.map((p) => p.nome).join(", ");
    const count = lowStock.length;
    const title = count === 1
      ? `Estoque baixo: ${lowStock[0].nome}`
      : `${count} produtos com estoque baixo`;
    const body = count === 1
      ? `${lowStock[0].nome} tem apenas ${lowStock[0].estoque_atual} unidade(s) em estoque.`
      : `${names} estão com estoque baixo (≤ 5 unidades).`;

    await supabase.from("notificacoes").insert({
      user_id: userId,
      type: "low_stock",
      title,
      body,
      data: { products: lowStock.map((p) => ({ id: p.id, name: p.nome, stock: p.estoque_atual })) },
    });

    sent++;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);

    if (!subs?.length) continue;

    const payload: PushPayload = {
      title,
      body,
      tag: "low_stock",
      url: "/produtos",
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
