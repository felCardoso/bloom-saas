"use client";

import { useState, useEffect } from "react";
import {
  Check, X, Users, ShoppingBag, Package, Calendar,
  BarChart3, MessageCircle, Bell, Download, UsersRound, HeadphonesIcon,
} from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { PLANS, PLAN_ORDER, PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

const FEATURES_TABLE = [
  { group: "Limites", rows: [
    { label: "Clientes", icon: Users, values: { free: "até 30", pro: "até 200", premium: "Ilimitado" } },
    { label: "Pedidos/mês", icon: ShoppingBag, values: { free: "até 20", pro: "até 150", premium: "Ilimitado" } },
    { label: "Produtos", icon: Package, values: { free: "até 20", pro: "até 100", premium: "Ilimitado" } },
    { label: "Eventos", icon: Calendar, values: { free: "até 15", pro: "Ilimitado", premium: "Ilimitado" } },
  ]},
  { group: "Recursos", rows: [
    { label: "Gráficos e relatórios", icon: BarChart3, values: { free: false, pro: true, premium: true } },
    { label: "Relatórios avançados", icon: BarChart3, values: { free: false, pro: false, premium: true } },
    { label: "Lembretes aniversário", icon: Bell, values: { free: false, pro: true, premium: true } },
    { label: "Link WhatsApp", icon: MessageCircle, values: { free: false, pro: true, premium: true } },
    { label: "Alertas estoque", icon: Package, values: { free: false, pro: true, premium: true } },
    { label: "Exportar CSV", icon: Download, values: { free: false, pro: false, premium: true } },
    { label: "Múltiplos usuários", icon: UsersRound, values: { free: false, pro: false, premium: "até 3" } },
    { label: "Suporte", icon: HeadphonesIcon, values: { free: "E-mail", pro: "E-mail", premium: "Prioritário (24h)" } },
  ]},
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)  return <Check className="w-4 h-4 text-emerald-500 mx-auto" />;
  if (value === false) return <X className="w-4 h-4 text-neutral-300 dark:text-neutral-600 mx-auto" />;
  return <span className="text-[11px] text-neutral-700 dark:text-neutral-300 font-medium leading-tight">{value}</span>;
}

function planKey(p: (typeof PLANS)[PlanId]) {
  const limits = [
    p.limits.clients === -1 ? "Clientes ilimitados" : `Até ${p.limits.clients} clientes`,
    p.limits.ordersPerMonth === -1 ? "Pedidos ilimitados" : `Até ${p.limits.ordersPerMonth} pedidos/mês`,
    p.limits.products === -1 ? "Produtos ilimitados" : `Até ${p.limits.products} produtos`,
  ];
  const supportLabel = { community: "Suporte por e-mail", email: "Suporte por e-mail", priority: "Suporte prioritário" }[p.features.support];
  const extras = [
    p.features.reportsBasic && !p.features.reportsAdvanced && "Relatórios e gráficos",
    p.features.reportsAdvanced && "Relatórios avançados",
    p.features.birthdayReminders && "Lembretes de aniversário",
    p.features.stockAlerts && "Alertas de estoque baixo",
    p.features.whatsappLink && "Link rápido para WhatsApp",
    p.features.csvExport && "Exportar dados (CSV)",
    p.features.multipleUsers > 0 && `Até ${p.features.multipleUsers} usuários`,
    supportLabel,
  ].filter(Boolean) as string[];
  return [...limits, ...extras];
}

export default function PricingPage() {
  const { planId, setPlanId } = usePlan();
  const [confirming, setConfirming] = useState<PlanId | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<PlanId | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
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
      setCheckoutError(null);
      setConfirming(null);
      try {
        const res = await fetch("/api/asaas/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ planId: confirming }),
        });
        const { url, error } = await res.json();
        if (url) {
          window.location.href = url;
        } else {
          setCheckoutError(error ?? "Erro ao iniciar checkout. Tente novamente.");
        }
      } catch {
        setCheckoutError("Erro de conexão. Verifique sua internet e tente novamente.");
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
      {checkoutError && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
          <X className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{checkoutError}</span>
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

      {/* Comparação — div grid sem min-width, não causa overflow */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-neutral-100 dark:border-neutral-800 px-4 py-2.5">
          <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500">Recurso</span>
          {PLAN_ORDER.map((id) => (
            <span key={id} className={cn(
              "text-xs font-bold text-center",
              id === planId ? "text-rose-500" : "text-neutral-500 dark:text-neutral-400",
            )}>
              {PLANS[id].name}
              {id === planId && (
                <span className="ml-1 text-[9px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1 py-0.5 rounded-full">
                  atual
                </span>
              )}
            </span>
          ))}
        </div>
        {FEATURES_TABLE.map((section) => (
          <div key={section.group}>
            <div className="px-4 py-2 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
              {section.group}
            </div>
            {section.rows.map((row) => (
              <div key={row.label} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-t border-neutral-50 dark:border-neutral-800/60 hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 transition-colors">
                <div className="px-4 py-2.5 flex items-center gap-1.5 min-w-0">
                  <row.icon className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
                  <span className="text-xs text-neutral-700 dark:text-neutral-300 truncate">{row.label}</span>
                </div>
                {PLAN_ORDER.map((id) => (
                  <div key={id} className={cn(
                    "py-2.5 flex items-center justify-center",
                    id === planId ? "bg-rose-50/50 dark:bg-rose-900/10" : "",
                  )}>
                    <FeatureValue value={row.values[id as keyof typeof row.values]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
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
