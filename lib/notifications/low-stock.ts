import type { SupabaseClient } from "@supabase/supabase-js";
import { sendPushNotification } from "@/lib/push";

const LOW_STOCK_THRESHOLD = 5;

type PushSubRow = {
  id: string;
  subscription: Parameters<typeof sendPushNotification>[0];
};

/**
 * Dispara notificação de estoque baixo (in-app + push) ao atualizar o estoque
 * de um produto, se o novo valor estiver ≤ {@link LOW_STOCK_THRESHOLD}.
 *
 * Comportamento:
 * - Respeita a preferência `stockAlerts` do usuário (gated por plano via UI).
 * - Dedupe **por produto por dia**: múltiplas atualizações do mesmo produto
 *   no mesmo dia disparam apenas uma notificação.
 * - Tolerante a falhas: erros de push ou query não devem quebrar o fluxo
 *   de update de estoque que chamou esta função.
 *
 * Complementa, sem substituir, o cron diário em `/api/cron/daily` que
 * varre o catálogo inteiro em batch.
 */
export async function maybeNotifyLowStock(
  supabase: SupabaseClient,
  userId: string,
  productId: string,
  newStock: number,
): Promise<void> {
  try {
    if (newStock > LOW_STOCK_THRESHOLD) return;

    const { data: profile } = await supabase
      .from("perfis_usuarios")
      .select("preferencias_notificacoes")
      .eq("id", userId)
      .maybeSingle();

    const prefs = (profile?.preferencias_notificacoes ?? {}) as Record<
      string,
      boolean
    >;
    if (!prefs.stockAlerts) return;

    const { data: product } = await supabase
      .from("produtos")
      .select("nome")
      .eq("id", productId)
      .maybeSingle();
    if (!product) return;

    const today = new Date().toISOString().slice(0, 10);
    const { count: existing } = await supabase
      .from("notificacoes")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("type", "low_stock")
      .filter("data->>productId", "eq", productId)
      .gte("created_at", `${today}T00:00:00Z`);

    if (existing && existing > 0) return;

    const title = `Estoque baixo: ${product.nome}`;
    const body =
      newStock === 0
        ? `${product.nome} está sem estoque.`
        : `${product.nome} tem apenas ${newStock} unidade${newStock === 1 ? "" : "s"}.`;

    await supabase.from("notificacoes").insert({
      user_id: userId,
      type: "low_stock",
      title,
      body,
      data: { productId, productName: product.nome, stock: newStock },
    });

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, subscription")
      .eq("user_id", userId);

    const pushSubs = (subs ?? []) as PushSubRow[];
    for (const sub of pushSubs) {
      const result = await sendPushNotification(sub.subscription, {
        title,
        body,
        tag: `low_stock:${productId}`,
        url: "/produtos",
      });
      if (result === "expired") {
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      }
    }
  } catch (err) {
    console.error("[maybeNotifyLowStock]", err);
  }
}
