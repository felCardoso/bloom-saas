"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { usePlan, Usage } from "@/lib/plan-context";
import { PLANS, RESOURCE_LABELS } from "@/lib/plans";
import { cn } from "@/lib/utils";
import Link from "next/link";

const RESOURCES: (keyof Usage)[] = [
  "clients",
  "ordersPerMonth",
  "products",
  "events",
];

export function UsageBanner() {
  const { planId, plan, usagePercent, remaining, canAdd } = usePlan();
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (planId === "premium") return null;

  const warnings = RESOURCES.flatMap((resource) => {
    const pct = usagePercent(resource);
    if (pct === null) return [];
    const key = `${resource}-${plan.limits[resource as keyof typeof plan.limits]}`;
    if (dismissed.includes(key)) return [];

    const isFull = !canAdd(resource);
    const isNear = pct >= 80;

    if (!isNear && !isFull) return [];

    return [{ resource, pct, isFull, key, rem: remaining(resource) }];
  });

  if (warnings.length === 0) return null;

  const warn = warnings[0];
  const label = RESOURCE_LABELS[warn.resource];

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm border-b",
        warn.isFull
          ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800 text-red-700 dark:text-red-400"
          : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-700 dark:text-amber-400",
      )}
    >
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <p className="flex-1 text-xs font-medium">
        {warn.isFull
          ? `Limite de ${label} atingido no plano ${PLANS[planId].name}.`
          : `Você está usando ${Math.round(warn.pct)}% do limite de ${label} — ${warn.rem} restante${warn.rem === 1 ? "" : "s"}.`}{" "}
        <Link
          href="/pricing"
          className="underline font-semibold hover:no-underline"
        >
          Fazer upgrade
        </Link>
      </p>
      <button
        onClick={() => setDismissed((d) => [...d, warn.key])}
        className="p-1 rounded-lg hover:bg-black/10 transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
