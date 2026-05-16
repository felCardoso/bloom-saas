"use client";

import { X, Sparkles, Check, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { usePlan } from "@/lib/plan-context";
import { PLANS, PLAN_ORDER, PlanId, PlanFeatures } from "@/lib/plans";
import { RESOURCE_LABELS, FEATURE_LABELS } from "@/lib/plans";
import type { Usage } from "@/lib/plan-context";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  /** Which resource hit the limit */
  resource?: keyof Usage;
  /** Which feature is gated */
  feature?: keyof PlanFeatures;
}

const TARGET_PLAN: Record<string, PlanId> = {
  // free → suggest pro, pro → suggest premium
};

export function UpgradeModal({ open, onClose, resource, feature }: UpgradeModalProps) {
  const { planId } = usePlan();

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const currentIdx = PLAN_ORDER.indexOf(planId);
  const suggestedPlanId = PLAN_ORDER[Math.min(currentIdx + 1, PLAN_ORDER.length - 1)] as PlanId;
  const suggestedPlan = PLANS[suggestedPlanId];

  const blockedLabel = resource
    ? RESOURCE_LABELS[resource]
    : feature
    ? FEATURE_LABELS[feature]
    : "esta funcionalidade";

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-elevated max-h-[92dvh] overflow-y-auto">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-neutral-200 rounded-full" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-neutral-400 hover:bg-neutral-100 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-6 pt-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 bg-rose-500 rounded-2xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-800">
                Faça upgrade para continuar
              </h2>
              <p className="text-sm text-neutral-500">
                Você atingiu o limite de{" "}
                <span className="font-medium text-neutral-700">{blockedLabel}</span>{" "}
                no plano {PLANS[planId].name}.
              </p>
            </div>
          </div>

          {/* Suggested plan card */}
          <div className="bg-rose-500 rounded-2xl p-5 text-white mb-5">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="text-xs font-semibold text-rose-200 uppercase tracking-wide mb-1">
                  Recomendado
                </p>
                <h3 className="text-xl font-bold">Plano {suggestedPlan.name}</h3>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold">
                  {suggestedPlan.price === 0 ? "Grátis" : `R$ ${suggestedPlan.price}`}
                </span>
                <span className="text-sm text-rose-200">{suggestedPlan.period}</span>
              </div>
            </div>
            <p className="text-sm text-rose-100 mb-4">{suggestedPlan.description}</p>
            <ul className="space-y-2">
              {[
                suggestedPlan.limits.clients === -1
                  ? "Clientes ilimitados"
                  : `Até ${suggestedPlan.limits.clients} clientes`,
                suggestedPlan.limits.ordersPerMonth === -1
                  ? "Pedidos ilimitados"
                  : `Até ${suggestedPlan.limits.ordersPerMonth} pedidos/mês`,
                suggestedPlan.features.revenueChart && "Gráficos e relatórios",
                suggestedPlan.features.whatsappLink && "Link rápido WhatsApp",
                suggestedPlan.features.stockAlerts && "Alertas de estoque",
                suggestedPlan.features.csvExport && "Exportar dados (CSV)",
              ]
                .filter(Boolean)
                .slice(0, 4)
                .map((f) => (
                  <li key={String(f)} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-rose-200 flex-shrink-0" />
                    <span>{String(f)}</span>
                  </li>
                ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-colors"
            >
              Ver todos os planos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={onClose}
              className="w-full py-3 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              Continuar no plano {PLANS[planId].name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
