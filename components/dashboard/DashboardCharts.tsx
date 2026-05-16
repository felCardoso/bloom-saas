"use client";

import { usePlan } from "@/lib/plan-context";
import { RevenueChart } from "./RevenueChart";
import { TopProducts } from "./TopProducts";
import { LockedFeature } from "@/components/ui/LockedFeature";

interface Props {
  monthlyRevenue: { month: string; revenue: number }[];
  topProducts: { name: string; quantity: number; revenue: number }[];
}

export function DashboardCharts({ monthlyRevenue, topProducts }: Props) {
  const { hasFeature } = usePlan();

  if (!hasFeature("revenueChart")) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <LockedFeature feature="revenueChart" blurred className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} />
        </LockedFeature>
        <LockedFeature feature="revenueChart" blurred>
          <TopProducts products={topProducts} />
        </LockedFeature>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <RevenueChart data={monthlyRevenue} />
      <TopProducts products={topProducts} />
    </div>
  );
}
