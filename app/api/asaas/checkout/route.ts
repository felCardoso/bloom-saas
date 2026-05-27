import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest, PLAN_TO_VALUE, PLAN_DESCRIPTIONS } from "@/lib/asaas";
import type { PlanId } from "@/lib/plans";

interface AsaasCustomer { id: string }
interface AsaasCustomerList { data: AsaasCustomer[]; totalCount: number }
interface AsaasSubscription { id: string; nextDueDate: string }
interface AsaasPayment { invoiceUrl: string }
interface AsaasPaymentList { data: AsaasPayment[] }

const PLAN_RANK: Record<PlanId, number> = { free: 0, pro: 1, premium: 2 };

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { planId, billingType = "UNDEFINED" } = await request.json() as {
    planId: string;
    billingType?: string;
  };
  const value = PLAN_TO_VALUE[planId];
  if (!value) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_customer_id, asaas_subscription_id, nome_completo, email, cpf_cnpj, plano")
    .eq("id", user.id)
    .single();

  const cpfCnpj = (profile?.cpf_cnpj as string | null)?.replace(/\D/g, "") ?? "";
  if (!cpfCnpj) {
    return NextResponse.json(
      { error: "Preencha seu CPF ou CNPJ em Configurações, aba Perfil, antes de assinar." },
      { status: 400 }
    );
  }

  const existingSubId = profile?.asaas_subscription_id as string | null;
  const currentPlan = (profile?.plano as PlanId | null) ?? "free";
  const newPlan = planId as PlanId;
  const isDowngrade = PLAN_RANK[newPlan] < PLAN_RANK[currentPlan];

  // Downgrade with active subscription: schedule the change for period end
  // so the user keeps the current (higher) plan they already paid for.
  if (existingSubId && isDowngrade) {
    let nextDueDate: string;
    try {
      const sub = await asaasRequest<AsaasSubscription>(`/subscriptions/${existingSubId}`);
      nextDueDate = sub.nextDueDate;
    } catch {
      return NextResponse.json({ error: "Erro ao consultar assinatura" }, { status: 502 });
    }

    try {
      // Lower the recurring value for the next cycle (current cycle already paid).
      await asaasRequest(`/subscriptions/${existingSubId}`, {
        method: "PUT",
        body: JSON.stringify({
          value,
          description: PLAN_DESCRIPTIONS[planId],
          externalReference: `${user.id}:${planId}`,
        }),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao agendar downgrade";
      return NextResponse.json({ error: msg }, { status: 502 });
    }

    await supabase
      .from("perfis_usuarios")
      .update({
        pending_plan: newPlan,
        asaas_period_end: nextDueDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({
      scheduled: true,
      pendingPlan: newPlan,
      expiresAt: nextDueDate,
    });
  }

  // Mid-cycle UPGRADE: update existing subscription and apply plan immediately.
  if (existingSubId) {
    try {
      await asaasRequest<AsaasSubscription>(`/subscriptions/${existingSubId}`, {
        method: "PUT",
        body: JSON.stringify({
          value,
          description: PLAN_DESCRIPTIONS[planId],
          externalReference: `${user.id}:${planId}`,
        }),
      });

      // Update plan immediately — webhook will confirm on next payment.
      // Also clear any previously-scheduled downgrade.
      await supabase
        .from("perfis_usuarios")
        .update({
          plano: planId,
          asaas_period_end: null,
          pending_plan: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      const payments = await asaasRequest<AsaasPaymentList>(
        `/payments?subscription=${existingSubId}&limit=1`
      );
      const url = payments.data[0]?.invoiceUrl ?? `${origin}/pricing?success=1`;
      return NextResponse.json({ url });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar assinatura";
      return NextResponse.json({ error: msg }, { status: 502 });
    }
  }

  try {
    // No existing subscription — create customer if needed, then create subscription
    let customerId = profile?.asaas_customer_id as string | null;

    if (!customerId) {
      const email = (profile?.email as string | null) ?? user.email ?? "";
      const list = await asaasRequest<AsaasCustomerList>(
        `/customers?email=${encodeURIComponent(email)}&limit=1`
      );

      if (list.data.length > 0) {
        customerId = list.data[0].id;
        // Update CPF on existing customer — may have been created without it
        await asaasRequest(`/customers/${customerId}`, {
          method: "PUT",
          body: JSON.stringify({ cpfCnpj }),
        }).catch(() => null); // non-fatal — proceed even if update fails
      } else {
        const customer = await asaasRequest<AsaasCustomer>("/customers", {
          method: "POST",
          body: JSON.stringify({
            name: (profile?.nome_completo as string | null) ?? "Usuário Bloom",
            email,
            cpfCnpj,
            externalReference: user.id,
          }),
        });
        customerId = customer.id;
      }

      await supabase
        .from("perfis_usuarios")
        .update({ asaas_customer_id: customerId })
        .eq("id", user.id);
    }

    if (!customerId) {
      return NextResponse.json({ error: "Não foi possível identificar o cliente no Asaas." }, { status: 502 });
    }

    // Next due date = tomorrow (avoids same-day charge)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 1);
    const dueDateStr = nextDueDate.toISOString().split("T")[0];

    const subscription = await asaasRequest<AsaasSubscription>("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        customer: customerId,
        billingType,
        value,
        nextDueDate: dueDateStr,
        cycle: "MONTHLY",
        description: PLAN_DESCRIPTIONS[planId],
        externalReference: `${user.id}:${planId}`,
        redirectUrl: `${origin}/pricing?success=1`,
      }),
    });

    await supabase
      .from("perfis_usuarios")
      .update({ asaas_subscription_id: subscription.id })
      .eq("id", user.id);

    const payments = await asaasRequest<AsaasPaymentList>(
      `/payments?subscription=${subscription.id}&limit=1`
    );
    const url = payments.data[0]?.invoiceUrl ?? `${origin}/pricing?success=1`;

    return NextResponse.json({ url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Erro ao criar assinatura";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
