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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);

  // Find users with pending order notifications enabled
  const { data: profiles } = await supabase
    .from("perfis_usuarios")
    .select("id")
    .filter("preferencias_notificacoes->pendingOrders", "eq", "true");

  if (!profiles?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const profile of profiles) {
    const userId = profile.id;

    const { data: orders } = await supabase
      .from("vendas")
      .select("id, clientes(nome)")
      .eq("user_id", userId)
      .eq("status", "pending")
      .lt("data_venda", cutoff.toISOString());

    if (!orders?.length) continue;

    const count = orders.length;
    const title = count === 1
      ? "Pedido pendente há mais de 7 dias"
      : `${count} pedidos pendentes há mais de 7 dias`;
    const clientName = (Array.isArray(orders[0].clientes) ? orders[0].clientes[0] : orders[0].clientes as { nome: string } | null)?.nome ?? "cliente";
    const body = count === 1
      ? `O pedido de ${clientName} ainda está pendente.`
      : "Você tem pedidos aguardando atualização. Verifique a lista de pedidos.";

    // One in-app notification per user (deduped by day via tag logic)
    const today = new Date().toISOString().slice(0, 10);
    const { count: existing } = await supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "pending_order")
      .gte("created_at", `${today}T00:00:00Z`);

    if (!existing) {
      await supabase.from("notificacoes").insert({
        user_id: userId,
        type: "pending_order",
        title,
        body,
        data: { count },
      });
      sent++;
    }

    // Push
    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);

    if (!subs?.length) continue;

    const payload: PushPayload = {
      title,
      body,
      tag: "pending_order",
      url: "/pedidos",
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
