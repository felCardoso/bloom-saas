import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";

interface AsaasSubscription {
  id: string;
  value: number;
  nextDueDate: string;
  cycle: string;
  description: string;
  billingType: string;
  status: string;
}

interface AsaasPayment {
  id: string;
  value: number;
  status: string;
  dueDate: string;
  invoiceUrl: string;
}
interface AsaasPaymentList { data: AsaasPayment[] }

const ALLOWED_BILLING_TYPES = ["UNDEFINED", "PIX", "BOLETO", "CREDIT_CARD"] as const;
type BillingType = (typeof ALLOWED_BILLING_TYPES)[number];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id, plano")
    .eq("id", user.id)
    .single();

  if (!profile?.asaas_subscription_id) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  try {
    const subscription = await asaasRequest<AsaasSubscription>(
      `/subscriptions/${profile.asaas_subscription_id}`
    );
    const payments = await asaasRequest<AsaasPaymentList>(
      `/payments?subscription=${profile.asaas_subscription_id}&limit=5`
    );
    const pending = payments.data.find((p) =>
      ["PENDING", "OVERDUE", "AWAITING_RISK_ANALYSIS"].includes(p.status)
    );

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        value: subscription.value,
        nextDueDate: subscription.nextDueDate,
        cycle: subscription.cycle,
        billingType: subscription.billingType,
        status: subscription.status,
        plan: profile.plano,
      },
      pendingPayment: pending
        ? {
            id: pending.id,
            value: pending.value,
            status: pending.status,
            dueDate: pending.dueDate,
            invoiceUrl: pending.invoiceUrl,
          }
        : null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao consultar assinatura";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { billingType } = (await request.json()) as { billingType?: string };
  if (!billingType || !ALLOWED_BILLING_TYPES.includes(billingType as BillingType)) {
    return NextResponse.json({ error: "Forma de pagamento inválida" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.asaas_subscription_id) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  try {
    await asaasRequest(`/subscriptions/${profile.asaas_subscription_id}`, {
      method: "PUT",
      body: JSON.stringify({ billingType }),
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao atualizar assinatura";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
