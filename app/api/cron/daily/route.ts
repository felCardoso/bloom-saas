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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = ReturnType<typeof createClient<any>>;
type Sub = { id: string; subscription: Parameters<typeof sendPushNotification>[0] };

async function safePush(supabase: SupabaseAdmin, subs: Sub[], payload: PushPayload) {
  for (const sub of subs) {
    const result = await sendPushNotification(sub.subscription, payload);
    if (result === "expired") {
      await supabase.from("push_subscriptions").delete().eq("id", sub.id);
    }
  }
}

export async function GET(req: Request) {
  if (!isCronAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().slice(0, 10);
  const pendingCutoff = new Date();
  pendingCutoff.setDate(pendingCutoff.getDate() - 7);
  const stats = { pending: 0, stock: 0 };

  const { data: profiles } = await supabase.from("perfis_usuarios").select("id, preferencias_notificacoes");
  if (!profiles?.length) return NextResponse.json(stats);

  for (const profile of profiles) {
    const prefs = (profile.preferencias_notificacoes ?? {}) as Record<string, boolean>;
    const userId = profile.id;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);
    const pushSubs = (subs ?? []) as Sub[];

    // ── Pending orders ──────────────────────────────────────────────────────
    if (prefs.pendingOrders) {
      const { data: orders } = await supabase
        .from("vendas")
        .select("id, clientes(nome)")
        .eq("user_id", userId)
        .eq("status", "pending")
        .lt("data_venda", pendingCutoff.toISOString());

      if (orders?.length) {
        const { count: existing } = await supabase
          .from("notificacoes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("type", "pending_order")
          .gte("created_at", `${today}T00:00:00Z`);

        if (!existing) {
          const count = orders.length;
          const title = count === 1 ? "Pedido pendente há mais de 7 dias" : `${count} pedidos pendentes há mais de 7 dias`;
          const clientName = (Array.isArray(orders[0].clientes) ? orders[0].clientes[0] : orders[0].clientes as { nome: string } | null)?.nome ?? "cliente";
          const body = count === 1
            ? `O pedido de ${clientName} ainda está pendente.`
            : "Você tem pedidos aguardando atualização.";

          await supabase.from("notificacoes").insert({ user_id: userId, type: "pending_order", title, body, data: { count } });
          stats.pending++;

          if (pushSubs.length) {
            await safePush(supabase, pushSubs, { title, body, tag: "pending_order", url: "/pedidos" });
          }
        }
      }
    }

    // ── Stock alerts ────────────────────────────────────────────────────────
    if (prefs.stockAlerts) {
      const { data: lowStock } = await supabase
        .from("produtos")
        .select("id, nome, estoque_atual")
        .eq("user_id", userId)
        .eq("ativo", true)
        .lte("estoque_atual", 5)
        .gt("estoque_atual", 0);

      if (lowStock?.length) {
        const { count: existing } = await supabase
          .from("notificacoes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("type", "low_stock")
          .gte("created_at", `${today}T00:00:00Z`);

        if (!existing) {
          const count = lowStock.length;
          const title = count === 1 ? `Estoque baixo: ${lowStock[0].nome}` : `${count} produtos com estoque baixo`;
          const body = count === 1
            ? `${lowStock[0].nome} tem apenas ${lowStock[0].estoque_atual} unidade(s).`
            : lowStock.map((p) => p.nome).join(", ") + " estão com estoque baixo.";

          await supabase.from("notificacoes").insert({
            user_id: userId,
            type: "low_stock",
            title,
            body,
            data: { products: lowStock.map((p) => ({ id: p.id, name: p.nome, stock: p.estoque_atual })) },
          });
          stats.stock++;

          if (pushSubs.length) {
            await safePush(supabase, pushSubs, { title, body, tag: "low_stock", url: "/produtos" });
          }
        }
      }
    }
  }

  return NextResponse.json(stats);
}
