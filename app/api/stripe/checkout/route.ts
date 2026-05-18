import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PLAN_TO_PRICE } from "@/lib/stripe";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { planId } = await request.json() as { planId: string };
  const priceId = PLAN_TO_PRICE[planId];
  if (!priceId) return NextResponse.json({ error: "Plano inválido" }, { status: 400 });

  const origin = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("stripe_customer_id, nome_completo, email")
    .eq("id", user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? "",
      name: profile?.nome_completo ?? "",
      metadata: { supabase_user_id: user.id },
    });
    customerId = customer.id;
    await supabase
      .from("perfis_usuarios")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/pricing?success=1`,
    cancel_url: `${origin}/pricing?canceled=1`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: user.id },
    },
  });

  return NextResponse.json({ url: session.url });
}
