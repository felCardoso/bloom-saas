import { Users, ShoppingBag, DollarSign, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { getDashboardStats, getRecentVendas } from "@/lib/actions/dashboard";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { getOnboardingStatus, getProfile } from "@/lib/actions/profile";
import { OnboardingWelcome } from "@/components/dashboard/OnboardingWelcome";

export default async function DashboardPage() {
  const [stats, recentOrders, onboardingDone, profile] = await Promise.all([
    getDashboardStats(),
    getRecentVendas(),
    getOnboardingStatus(),
    getProfile(),
  ]);

  const trend =
    stats.revenue_prev_month > 0
      ? Math.round(
          ((stats.revenue_month - stats.revenue_prev_month) /
            stats.revenue_prev_month) *
            100
        )
      : 0;

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Onboarding */}
      {!onboardingDone && <OnboardingWelcome userName={profile.name} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Clientes"
          value={stats.total_clients}
          subtitle={`${stats.active_clients} ativas`}
          icon={Users}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
        />
        <StatCard
          title="Pedidos"
          value={stats.total_orders}
          subtitle={`${stats.pending_orders} pendentes`}
          icon={ShoppingBag}
          iconColor="text-violet-500"
          iconBg="bg-violet-50"
        />
        <StatCard
          title="Receita"
          value={formatCurrency(stats.revenue_month)}
          subtitle="este mês"
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
          trend={trend}
        />
        <StatCard
          title="Pendentes"
          value={stats.pending_orders}
          subtitle="a entregar"
          icon={Clock}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts — gated for free plan */}
      <DashboardCharts
        monthlyRevenue={stats.monthly_revenue}
        topProducts={stats.top_products}
      />

      {/* Recent orders */}
      <RecentOrders orders={recentOrders} />
    </div>
  );
}
