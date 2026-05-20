const BASE =
  process.env.ASAAS_SANDBOX === "true"
    ? "https://sandbox.asaas.com/api/v3"
    : "https://api.asaas.com/v3";

export async function asaasRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "access_token": process.env.ASAAS_API_KEY!,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(
      (data as { errors?: { description: string }[] }).errors?.[0]?.description ??
        `Asaas error ${res.status}`
    );
  }
  return res.json() as Promise<T>;
}

export const PLAN_TO_VALUE: Record<string, number> = {
  pro: Number(process.env.ASAAS_PRO_VALUE ?? "29.00"),
  premium: Number(process.env.ASAAS_PREMIUM_VALUE ?? "59.00"),
};

export const PLAN_DESCRIPTIONS: Record<string, string> = {
  pro: "Bloom Pro — assinatura mensal",
  premium: "Bloom Premium — assinatura mensal",
};
