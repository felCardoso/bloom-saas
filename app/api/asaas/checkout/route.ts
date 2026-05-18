import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest, PLAN_TO_VALUE, PLAN_DESCRIPTIONS } from "@/lib/asaas";

interface AsaasCustomer { id: string }
interface AsaasCustomerList { data: AsaasCustomer[]; totalCount: number }
interface AsaasSubscription { id: string }
interface AsaasPayment { invoiceUrl: string }
interface AsaasPaymentList { data: AsaasPayment[] }

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
    .select("asaas_customer_id, nome_completo, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.asaas_customer_id as string | null;

  if (!customerId) {
    const email = (profile?.email as string | null) ?? user.email ?? "";
    const list = await asaasRequest<AsaasCustomerList>(
      `/customers?email=${encodeURIComponent(email)}&limit=1`
    );

    if (list.data.length > 0) {
      customerId = list.data[0].id;
    } else {
      const customer = await asaasRequest<AsaasCustomer>("/customers", {
        method: "POST",
        body: JSON.stringify({
          name: (profile?.nome_completo as string | null) ?? "Usuário Bloom",
          email,
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

  // Get the first generated charge's payment page
  const payments = await asaasRequest<AsaasPaymentList>(
    `/payments?subscription=${subscription.id}&limit=1`
  );
  const url = payments.data[0]?.invoiceUrl ?? `${origin}/pricing?success=1`;

  return NextResponse.json({ url });
}
