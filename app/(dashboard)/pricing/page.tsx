"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Check,
  X,
  Sparkles,
  Users,
  ShoppingBag,
  Package,
  Calendar,
  BarChart3,
  MessageCircle,
  Bell,
  Download,
  UsersRound,
  HeadphonesIcon,
  Zap,
} from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { PLANS, PLAN_ORDER, PlanId } from "@/lib/plans";
import { cn } from "@/lib/utils";

const FEATURES_TABLE = [
  {
    group: "Limites",
    rows: [
      {
        label: "Clientes",
        icon: Users,
        values: { free: "até 30", pro: "até 200", premium: "Ilimitado" },
      },
      {
        label: "Pedidos por mês",
        icon: ShoppingBag,
        values: { free: "até 20", pro: "até 150", premium: "Ilimitado" },
      },
      {
        label: "Produtos",
        icon: Package,
        values: { free: "até 20", pro: "até 100", premium: "Ilimitado" },
      },
      {
        label: "Eventos na agenda",
        icon: Calendar,
        values: { free: "até 15", pro: "Ilimitado", premium: "Ilimitado" },
      },
    ],
  },
  {
    group: "Dashboard & Relatórios",
    rows: [
      {
        label: "KPIs e estatísticas",
        icon: Zap,
        values: { free: true, pro: true, premium: true },
      },
      {
        label: "Gráfico de receita",
        icon: BarChart3,
        values: { free: false, pro: true, premium: true },
      },
      {
        label: "Relatórios básicos",
        icon: BarChart3,
        values: { free: false, pro: true, premium: true },
      },
      {
        label: "Relatórios avançados",
        icon: BarChart3,
        values: { free: false, pro: false, premium: true },
      },
    ],
  },
  {
    group: "Produtividade",
    rows: [
      {
        label: "Lembretes de aniversário",
        icon: Bell,
        values: { free: false, pro: true, premium: true },
      },
      {
        label: "Link rápido WhatsApp",
        icon: MessageCircle,
        values: { free: false, pro: true, premium: true },
      },
      {
        label: "Alertas de estoque baixo",
        icon: Package,
        values: { free: false, pro: true, premium: true },
      },
    ],
  },
  {
    group: "Avançado",
    rows: [
      {
        label: "Exportar dados (CSV)",
        icon: Download,
        values: { free: false, pro: false, premium: true },
      },
      {
        label: "Múltiplos usuários",
        icon: UsersRound,
        values: { free: false, pro: false, premium: "até 3" },
      },
      {
        label: "Suporte",
        icon: HeadphonesIcon,
        values: {
          free: "Comunidade",
          pro: "E-mail (48h)",
          premium: "Prioritário (24h)",
        },
      },
    ],
  },
];

function FeatureValue({ value }: { value: boolean | string }) {
  if (value === true)
    return <Check className="w-5 h-5 text-emerald-500 mx-auto" />;
  if (value === false)
    return <X className="w-4 h-4 text-neutral-300 mx-auto" />;
  return <span className="text-sm text-neutral-700 dark:text-neutral-300 font-medium">{value}</span>;
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
    // Paid plans go to Stripe
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
    // Downgrade to free — just update in DB
    setPlanId("free");
    setConfirming(null);
  }

  const currentIdx = PLAN_ORDER.indexOf(planId);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-semibold px-4 py-1.5 rounded-full border border-rose-100 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          Planos e preços
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 dark:text-neutral-100">
          Escolha o plano ideal para você
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm lg:text-base max-w-lg mx-auto">
          Comece grátis e faça upgrade conforme seu negócio cresce. Sem
          surpresas.
        </p>
        {planId !== "free" && (
          <p className="text-xs text-neutral-400">
            Você está no plano{" "}
            <span className="font-semibold text-rose-500">
              {PLANS[planId].name}
            </span>{" "}
            — altere abaixo para simular outros planos.
          </p>
        )}
      </div>

      {/* Flash messages */}
      {flash === "success" && (
        <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm text-emerald-700 dark:text-emerald-400 text-center">
          🎉 Assinatura ativada com sucesso! Bem-vinda ao plano premium.
        </div>
      )}
      {flash === "canceled" && (
        <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-600 dark:text-neutral-400 text-center">
          Checkout cancelado. Você pode tentar novamente quando quiser.
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLAN_ORDER.map((id) => {
          const p = PLANS[id];
          const idx = PLAN_ORDER.indexOf(id);
          const isCurrent = id === planId;
          const isDowngrade = idx < currentIdx;
          const isPro = id === "pro";

          return (
            <div
              key={id}
              className={cn(
                "relative rounded-2xl border p-5 lg:p-6 flex flex-col",
                isCurrent
                  ? "border-rose-300 ring-2 ring-rose-200 dark:ring-rose-900"
                  : "border-neutral-200 dark:border-neutral-800",
                isPro ? "bg-rose-500 text-white" : "bg-white dark:bg-neutral-900",
              )}
            >
              {/* Popular badge */}
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-neutral-900 text-white text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    {p.badge}
                  </span>
                </div>
              )}

              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <span
                    className={cn(
                      "text-[11px] font-bold px-3 py-1 rounded-full",
                      isPro
                        ? "bg-white text-rose-600"
                        : "bg-rose-500 text-white",
                    )}
                  >
                    Plano atual
                  </span>
                </div>
              )}

              <div className="mb-4">
                <p
                  className={cn(
                    "text-sm font-semibold mb-1",
                    isPro ? "text-rose-100" : "text-neutral-500 dark:text-neutral-400",
                  )}
                >
                  {p.name}
                </p>
                <div className="flex items-baseline gap-1">
                  <span
                    className={cn(
                      "text-3xl font-bold",
                      isPro ? "text-white" : "text-neutral-800 dark:text-neutral-100",
                    )}
                  >
                    {p.price === 0 ? "Grátis" : `R$ ${p.price}`}
                  </span>
                  {p.period && (
                    <span
                      className={cn(
                        "text-sm",
                        isPro ? "text-rose-200" : "text-neutral-400",
                      )}
                    >
                      {p.period}
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs mt-1",
                    isPro ? "text-rose-100" : "text-neutral-400",
                  )}
                >
                  {p.description}
                </p>
              </div>

              {/* Key limits */}
              <ul className="space-y-2 flex-1 mb-6">
                {[
                  p.limits.clients === -1
                    ? "Clientes ilimitados"
                    : `${p.limits.clients} clientes`,
                  p.limits.ordersPerMonth === -1
                    ? "Pedidos ilimitados"
                    : `${p.limits.ordersPerMonth} pedidos/mês`,
                  p.limits.products === -1
                    ? "Produtos ilimitados"
                    : `${p.limits.products} produtos`,
                  p.features.revenueChart && "Gráficos e relatórios",
                  p.features.whatsappLink && "Link WhatsApp",
                  p.features.stockAlerts && "Alertas de estoque",
                  p.features.csvExport && "Exportar CSV",
                  p.features.multipleUsers > 0 &&
                    `Até ${p.features.multipleUsers} usuários`,
                ]
                  .filter(Boolean)
                  .map((f) => (
                    <li
                      key={String(f)}
                      className={cn(
                        "flex items-center gap-2 text-sm",
                        isPro ? "text-white" : "text-neutral-600",
                      )}
                    >
                      <Check
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isPro ? "text-rose-200" : "text-rose-500",
                        )}
                      />
                      {String(f)}
                    </li>
                  ))}
              </ul>

              <button
                onClick={() => selectPlan(id)}
                disabled={isCurrent || checkoutLoading === id}
                className={cn(
                  "w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2",
                  isCurrent
                    ? isPro
                      ? "bg-white/20 text-white cursor-default"
                      : "bg-neutral-100 text-neutral-400 cursor-default"
                    : isPro
                      ? "bg-white text-rose-600 hover:bg-rose-50"
                      : isDowngrade
                        ? "border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
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
          );
        })}
      </div>

      {/* Confirm switch */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setConfirming(null)}
          />
          <div className="relative bg-white dark:bg-neutral-900 w-full md:max-w-sm rounded-t-3xl md:rounded-2xl p-6 shadow-elevated">
            <div className="flex justify-center mb-1 md:hidden">
              <div className="w-10 h-1 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            </div>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100 mb-1">
              Mudar para o plano {PLANS[confirming].name}?
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
              {PLAN_ORDER.indexOf(confirming) < PLAN_ORDER.indexOf(planId)
                ? "Você perderá acesso a algumas funcionalidades. Dados existentes são mantidos em modo leitura."
                : "Você terá acesso imediato a todas as funcionalidades do plano selecionado."}
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

      {/* Feature comparison table */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
            Comparação completa
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-130">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                <th className="text-left px-5 py-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide w-[40%]">
                  Funcionalidade
                </th>
                {PLAN_ORDER.map((id) => (
                  <th
                    key={id}
                    className={cn(
                      "px-4 py-3 text-xs font-bold uppercase tracking-wide text-center",
                      id === planId ? "text-rose-500" : "text-neutral-500 dark:text-neutral-400",
                    )}
                  >
                    {PLANS[id].name}
                    {id === planId && (
                      <span className="ml-1.5 text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-semibold normal-case tracking-normal">
                        atual
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES_TABLE.map((section) => (
                <Fragment key={section.group}>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/40">
                    <td
                      colSpan={4}
                      className="px-5 py-2.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide"
                    >
                      {section.group}
                    </td>
                  </tr>
                  {section.rows.map((row) => (
                    <tr
                      key={row.label}
                      className="border-t border-neutral-50 dark:border-neutral-800 hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <row.icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0" />
                          <span className="text-sm text-neutral-700 dark:text-neutral-300">
                            {row.label}
                          </span>
                        </div>
                      </td>
                      {PLAN_ORDER.map((id) => (
                        <td
                          key={id}
                          className={cn(
                            "px-4 py-3.5 text-center",
                            id === planId ? "bg-rose-50/40 dark:bg-rose-900/10" : "",
                          )}
                        >
                          <FeatureValue
                            value={row.values[id as keyof typeof row.values]}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ mini */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        {[
          {
            q: "Posso cancelar quando quiser?",
            a: "Sim. Sem fidelidade. Cancele a qualquer momento e continue até o fim do período pago.",
          },
          {
            q: "O que acontece com meus dados no downgrade?",
            a: "Todos os dados são mantidos em modo leitura. Você pode voltar para o plano superior sem perder nada.",
          },
          {
            q: "Posso testar o Pro antes de pagar?",
            a: "Sim! Experimente 14 dias grátis sem cartão de crédito. Cancele antes e não cobraremos nada.",
          },
          {
            q: "E se eu precisar de mais usuários?",
            a: "O plano Premium inclui até 3 usuários. Para times maiores, entre em contato.",
          },
        ].map((faq) => (
          <div
            key={faq.q}
            className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card p-5"
          >
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1.5">
              {faq.q}
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
