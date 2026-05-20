import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { asaasRequest } from "@/lib/asaas";

interface AsaasPayment {
  id: string;
  value: number;
  status: string;
  dueDate: string;
  paymentDate: string | null;
  invoiceUrl: string;
  description: string;
}

interface AsaasPaymentList {
  data: AsaasPayment[];
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const { data: profile } = await supabase
    .from("perfis_usuarios")
    .select("asaas_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.asaas_subscription_id) {
    return NextResponse.json({ invoices: [] });
  }

  try {
    const payments = await asaasRequest<AsaasPaymentList>(
      `/payments?subscription=${profile.asaas_subscription_id}&limit=12`
    );
    return NextResponse.json({
      invoices: payments.data.map((p) => ({
        id: p.id,
        value: p.value,
        status: p.status,
        dueDate: p.dueDate,
        paymentDate: p.paymentDate ?? null,
        invoiceUrl: p.invoiceUrl,
        description: p.description,
      })),
    });
  } catch {
    return NextResponse.json({ invoices: [] });
  }
}
