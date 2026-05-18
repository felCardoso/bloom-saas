"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { PLANS, PLAN_ORDER, PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

function planKey(p: (typeof PLANS)[PlanId]) {
  const limits = [
    p.limits.clients === -1 ? "Clientes ilimitados" : `${p.limits.clients} clientes`,
    p.limits.ordersPerMonth === -1 ? "Pedidos ilimitados" : `${p.limits.ordersPerMonth} pedidos/mês`,
    p.limits.products === -1 ? "Produtos ilimitados" : `${p.limits.products} produtos`,
  ];
  const extras = [
    p.features.revenueChart && "Gráficos e relatórios",
    p.features.whatsappLink && "Link WhatsApp",
    p.features.stockAlerts && "Alertas de estoque",
    p.features.csvExport && "Exportar CSV",
    p.features.multipleUsers > 0 && `Até ${p.features.multipleUsers} usuários`,
  ].filter(Boolean) as string[];
  return [...limits, ...extras];
}

export default function PricingPage() {
  const { planId, setPlanId } = usePlan();
  const [confirming, setConfirming] = useState<PlanId | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);
  const [flash, setFlash] = useState<"success" | "canceled" | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) setFlash("success");
    else if (params.get("canceled")) setFlash("canceled");
    window.history.replaceState({}, "", "/pricing");
  }, []);

  function selectPlan(id: PlanId) {
    if (id === planId) return;
    setConfirming(id);
  }

  async function confirmSwitch() {
    if (!confirming) return;
    if (confirming !== "free") {
      setCheckoutLoading(confirming);
      setConfirming(null);
      try {
        const res = await fetch("/api/asaas/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: confirming }),
        });
        const { url, error } = await res.json();
        if (url) window.location.href = url;
        else console.error(error);
      } finally {
        setCheckoutLoading(null);
      }
      return;
    }
    setPlanId("free");
    setConfirming(null);
  }

  const currentIdx = PLAN_ORDER.indexOf(planId);

  return (
    <div className="space-y-4">
      {/* Flash messages */}
      {flash === "success" && (
        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400">
          🎉 Assinatura ativada com sucesso! Bem-vinda ao novo plano.
        </div>
      )}
      {flash === "canceled" && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-600 dark:text-neutral-400">
          Checkout cancelado. Você pode tentar novamente quando quiser.
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const idx = PLAN_ORDER.indexOf(id);
          const isCurrent = id === planId;
          const isDowngrade = idx < currentIdx;
          const isFeatured = id === "pro";

          return (
            <div
              key={id}
              className={cn(
                "relative rounded-2xl border flex flex-col",
                isFeatured
                  ? "bg-rose-500 border-rose-400"
                  : isCurrent
                    ? "bg-white dark:bg-neutral-900 border-rose-300 ring-2 ring-rose-100 dark:ring-rose-900/40"
                    : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800",
              )}
            >
              {/* Badge row */}
              {(p.badge || isCurrent) && (
                <div className="flex items-center gap-2 px-4 pt-3 pb-0">
                  {p.badge && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      isFeatured ? "bg-white/20 text-white" : "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900",
                    )}>
                      {p.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      isFeatured ? "bg-white text-rose-600" : "bg-rose-500 text-white",
                    )}>
                      Plano atual
                    </span>
                  )}
                </div>
              )}

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Name + price */}
                <div>
                  <p className={cn(
                    "text-xs font-semibold mb-1",
                    isFeatured ? "text-rose-100" : "text-neutral-500 dark:text-neutral-400",
                  )}>
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={cn(
                      "text-2xl font-bold",
                      isFeatured ? "text-white" : "text-neutral-800 dark:text-neutral-100",
                    )}>
                      {p.price === 0 ? "Grátis" : `R$ ${p.price}`}
                    </span>
                    {p.period && (
                      <span className={cn(
                        "text-sm",
                        isFeatured ? "text-rose-200" : "text-neutral-400",
                      )}>
                        {p.period}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs mt-0.5",
                    isFeatured ? "text-rose-100" : "text-neutral-400 dark:text-neutral-500",
                  )}>
                    {p.description}
                  </p>
                </div>

                {/* Key features */}
                <ul className="space-y-1.5 flex-1">
                  {planKey(p).map((f) => (
                    <li key={f} className={cn(
                      "flex items-center gap-2 text-sm",
                      isFeatured ? "text-white" : "text-neutral-600 dark:text-neutral-300",
                    )}>
                      <Check className={cn(
                        "w-3.5 h-3.5 shrink-0",
                        isFeatured ? "text-rose-200" : "text-rose-500",
                      )} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => selectPlan(id)}
                  disabled={isCurrent || checkoutLoading === id}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 mt-1",
                    isCurrent
                      ? isFeatured
                        ? "bg-white/20 text-white cursor-default"
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-default"
                      : isFeatured
                        ? "bg-white text-rose-600 hover:bg-rose-50"
                        : isDowngrade
                          ? "border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          : "bg-rose-500 text-white hover:bg-rose-600",
                  )}
                >
                  {checkoutLoading === id ? (
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  ) : isCurrent
                    ? "Plano atual"
                    : isDowngrade
                      ? "Fazer downgrade"
                      : id === "free"
                        ? "Usar grátis"
                        : `Assinar ${p.name}`}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm switch modal */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setConfirming(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 shadow-elevated">
            <div className="flex justify-center mb-3 sm:hidden">
              <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 mb-1">
              Mudar para o plano {PLANS[confirming].name}?
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
              {PLAN_ORDER.indexOf(confirming) < PLAN_ORDER.indexOf(planId)
                ? "Você perderá acesso a algumas funcionalidades. Seus dados são mantidos."
                : "Você terá acesso imediato às funcionalidades do novo plano."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirming(null)}
                className="flex-1 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmSwitch}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
