import { NextResponse } from "next/server";
import { stripe, PRICE_TO_PLAN } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import type Stripe from "stripe";

async function syncSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id ?? "";
  const plan = PRICE_TO_PLAN[priceId] ?? "free";
  const isActive = subscription.status === "active" || subscription.status === "trialing";

  await supabase
    .from("perfis_usuarios")
    .update({
      plano: isActive ? plan : "free",
      stripe_subscription_id: isActive ? subscription.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Configuração de webhook incompleta" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Assinatura de webhook inválida" }, { status: 400 });
  }

  const supabase = await createClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        await syncSubscription(supabase, subscription);
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncSubscription(supabase, subscription);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
