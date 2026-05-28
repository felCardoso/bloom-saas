"use client";

import dynamic from "next/dynamic";
import { usePlan } from "@/lib/plan-context";
import { TopProducts } from "./TopProducts";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { Skeleton } from "@/components/ui/Skeleton";

const RevenueChart = dynamic(
  () => import("./RevenueChart").then((m) => ({ default: m.RevenueChart })),
  {
    ssr: false,
    loading: () => (
      <div className="lg:col-span-2 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-card">
        <Skeleton className="h-5 w-48 mb-4" />
        <Skeleton className="h-52 w-full" />
      </div>
    ),
  },
);

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
