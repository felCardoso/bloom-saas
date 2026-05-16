import { Users, ShoppingBag, DollarSign, Clock, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { mockDashboardStats, mockOrders, mockSchedule } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

const trend = Math.round(
  ((mockDashboardStats.revenue_month - mockDashboardStats.revenue_prev_month) /
    mockDashboardStats.revenue_prev_month) *
    100,
);

const eventTypeMap = {
  follow_up: { label: "Follow-up", variant: "rose" as const },
  entrega: { label: "Entrega", variant: "blue" as const },
  aniversario: { label: "Aniversário", variant: "yellow" as const },
  outro: { label: "Outro", variant: "gray" as const },
};

export default function DashboardPage() {
  const upcoming = mockSchedule.filter((e) => !e.completed).slice(0, 4);

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard
          title="Clientes"
          value={mockDashboardStats.total_clients}
          subtitle={`${mockDashboardStats.active_clients} ativas`}
          icon={Users}
          iconColor="text-rose-500"
          iconBg="bg-rose-50"
          trend={8}
        />
        <StatCard
          title="Pedidos"
          value={mockDashboardStats.total_orders}
          subtitle={`${mockDashboardStats.pending_orders} pendentes`}
          icon={ShoppingBag}
          iconColor="text-violet-500"
          iconBg="bg-violet-50"
          trend={12}
        />
        <StatCard
          title="Receita"
          value={formatCurrency(mockDashboardStats.revenue_month)}
          subtitle="este mês"
          icon={DollarSign}
          iconColor="text-emerald-500"
          iconBg="bg-emerald-50"
          trend={trend}
        />
        <StatCard
          title="Pendentes"
          value={mockDashboardStats.pending_orders}
          subtitle="a entregar"
          icon={Clock}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Charts — gated for free plan */}
      <DashboardCharts
        monthlyRevenue={mockDashboardStats.monthly_revenue}
        topProducts={mockDashboardStats.top_products}
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentOrders orders={mockOrders.slice(0, 4)} />
        </div>

        <Card padding="none">
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-base font-semibold text-neutral-800">
              Próximos Eventos
            </h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {upcoming.map((event) => {
              const type = eventTypeMap[event.type];
              return (
                <div
                  key={event.id}
                  className="px-4 py-3.5 flex items-start gap-3 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {new Date(event.date).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                    <Badge variant={type.variant} className="mt-1.5">
                      {type.label}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
