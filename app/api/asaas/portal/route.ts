import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";

interface AsaasPayment { invoiceUrl: string }
interface AsaasPaymentList { data: AsaasPayment[] }

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id")
    .eq("id", user.id)
    .single();

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000";

  const subscriptionId = profile?.asaas_subscription_id as string | null;
  if (!subscriptionId) {
    return NextResponse.json({ error: "Sem assinatura ativa" }, { status: 400 });
  }

  // Redirect to the most recent charge's invoice page (allows viewing/paying invoices)
  const payments = await asaasRequest<AsaasPaymentList>(
    `/payments?subscription=${subscriptionId}&limit=1`
  );
  const url = payments.data[0]?.invoiceUrl ?? `${origin}/configuracoes`;

  return NextResponse.json({ url });
}
