"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { PLANS, PlanId, Plan, PlanFeatures } from "./plans";
import { updatePlan } from "@/lib/actions/profile";

export interface Usage {
  clients: number;
  ordersPerMonth: number;
  products: number;
  events: number;
}

interface PlanContextType {
  plan: Plan;
  planId: PlanId;
  setPlanId: (id: PlanId) => void;
  usage: Usage;
  setUsage: (u: Partial<Usage>) => void;
  // Returns false when the resource limit is reached
  canAdd: (resource: keyof Usage) => boolean;
  // Returns true when usage >= 80% of limit
  isNearLimit: (resource: keyof Usage) => boolean;
  // Returns 0-100, or null when unlimited
  usagePercent: (resource: keyof Usage) => number | null;
  // Remaining slots, or null when unlimited
  remaining: (resource: keyof Usage) => number | null;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
}

const PlanContext = createContext<PlanContextType | null>(null);

const LIMIT_KEY: Record<keyof Usage, keyof Plan["limits"]> = {
  clients: "clients",
  ordersPerMonth: "ordersPerMonth",
  products: "products",
  events: "events",
};

export function PlanProvider({
  children,
  initialPlan = "free",
  initialUsage,
}: {
  children: ReactNode;
  initialPlan?: PlanId;
  initialUsage?: Partial<Usage>;
}) {
  const [planId, _setPlanId] = useState<PlanId>(initialPlan);

  const setPlanId = useCallback((id: PlanId) => {
    _setPlanId(id);
    updatePlan(id);
  }, []);
  const [usage, setUsageState] = useState<Usage>({
    clients: 6,
    ordersPerMonth: 5,
    products: 8,
    events: 5,
    ...initialUsage,
  });

  const plan = PLANS[planId];

  const setUsage = useCallback((u: Partial<Usage>) => {
    setUsageState((prev) => ({ ...prev, ...u }));
  }, []);

  const canAdd = useCallback(
    (resource: keyof Usage) => {
      const limit = plan.limits[LIMIT_KEY[resource]];
      if (limit === -1) return true;
      return usage[resource] < limit;
    },
    [plan, usage],
  );

  const isNearLimit = useCallback(
    (resource: keyof Usage) => {
      const limit = plan.limits[LIMIT_KEY[resource]];
      if (limit === -1) return false;
      return usage[resource] / limit >= 0.8;
    },
    [plan, usage],
  );

  const usagePercent = useCallback(
    (resource: keyof Usage) => {
      const limit = plan.limits[LIMIT_KEY[resource]];
      if (limit === -1) return null;
      return Math.min((usage[resource] / limit) * 100, 100);
    },
    [plan, usage],
  );

  const remaining = useCallback(
    (resource: keyof Usage) => {
      const limit = plan.limits[LIMIT_KEY[resource]];
      if (limit === -1) return null;
      return Math.max(limit - usage[resource], 0);
    },
    [plan, usage],
  );

  const hasFeature = useCallback(
    (feature: keyof PlanFeatures) => {
      const val = plan.features[feature];
      if (typeof val === "boolean") return val;
      if (typeof val === "number") return val > 0;
      return true;
    },
    [plan],
  );

  return (
    <PlanContext.Provider
      value={{
        plan,
        planId,
        setPlanId,
        usage,
        setUsage,
        canAdd,
        isNearLimit,
        usagePercent,
        remaining,
        hasFeature,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used inside PlanProvider");
  return ctx;
}
