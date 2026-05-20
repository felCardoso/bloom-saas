import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

interface AsaasPaymentEvent {
  event: string;
  payment: {
    id: string;
    value: number;
    subscription: string | null;
    customer: string;
    externalReference: string | null;
    status: string;
    dueDate: string;
  };
}

interface AsaasSubscriptionEvent {
  event: string;
  subscription: {
    id: string;
    customer: string;
    externalReference: string | null;
    status: string;
  };
}

export async function POST(request: Request) {
  const token = request.headers.get("asaas-access-token");
  if (!process.env.ASAAS_WEBHOOK_TOKEN || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const body = await request.json() as AsaasPaymentEvent | AsaasSubscriptionEvent;
  const supabase = createServiceClient();

  switch (body.event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED": {
      const { payment } = body as AsaasPaymentEvent;
      const subscriptionId = payment.subscription;
      const externalRef = payment.externalReference;

      if (subscriptionId && externalRef) {
        const planId = externalRef.split(":")[1];
        if (planId === "pro" || planId === "premium") {
          await supabase
            .from("perfis_usuarios")
            .update({
              plano: planId,
              asaas_subscription_id: subscriptionId,
              asaas_period_end: null, // clear any pending cancellation
              updated_at: new Date().toISOString(),
            })
            .eq("asaas_customer_id", payment.customer);
        }
      }
      break;
    }

    case "PAYMENT_OVERDUE": {
      const { payment } = body as AsaasPaymentEvent;
      // Find user by customer id and create an in-app notification
      const { data: perfil } = await supabase
        .from("perfis_usuarios")
        .select("id")
        .eq("asaas_customer_id", payment.customer)
        .single();
      if (perfil?.id) {
        const dueFormatted = new Date(payment.dueDate + "T12:00:00").toLocaleDateString("pt-BR", {
          day: "2-digit", month: "long",
        });
        await supabase.from("notificacoes").insert({
          user_id: perfil.id,
          type: "billing",
          title: "Pagamento em atraso",
          body: `Sua fatura de R$ ${Number(payment.value).toFixed(2)} venceu em ${dueFormatted}. Regularize para manter o acesso ao plano.`,
          data: { payment_id: payment.id, invoice_url: null },
        });
      }
      break;
    }

    case "SUBSCRIPTION_DELETED":
    case "SUBSCRIPTION_INACTIVATED": {
      const { subscription } = body as AsaasSubscriptionEvent;
      // Only downgrade immediately if there is no active period_end scheduled.
      // When the user cancels via the app, period_end is set and the plan stays
      // active until that date — getUserPlan handles the lazy expiry.
      await supabase
        .from("perfis_usuarios")
        .update({
          asaas_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("asaas_customer_id", subscription.customer)
        .is("asaas_period_end", null); // only touch rows with no scheduled expiry
      // For rows that DO have asaas_period_end, getUserPlan will expire them lazily.
      break;
    }
  }

  return NextResponse.json({ received: true });
}
