import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface AsaasPaymentEvent {
  event: string;
  payment: {
    id: string;
    subscription: string | null;
    customer: string;
    externalReference: string | null;
    status: string;
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
  const supabase = await createClient();

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
              updated_at: new Date().toISOString(),
            })
            .eq("asaas_customer_id", payment.customer);
        }
      }
      break;
    }

    case "SUBSCRIPTION_DELETED":
    case "SUBSCRIPTION_INACTIVATED": {
      const { subscription } = body as AsaasSubscriptionEvent;
      await supabase
        .from("perfis_usuarios")
        .update({
          plano: "free",
          asaas_subscription_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("asaas_customer_id", subscription.customer);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
