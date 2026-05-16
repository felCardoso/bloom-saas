"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { mockDashboardStats, mockOrders, mockClients } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, ShoppingBag, DollarSign } from "lucide-react";

const ROSE_PALETTE = ["#D4829C", "#E8A4B8", "#A85C78", "#F2C4D4", "#8C4D65"];

const categoryRevenue = [
  { name: "Maquiagem", revenue: 1178 },
  { name: "Skincare", revenue: 635 },
  { name: "Perfumaria", revenue: 216 },
  { name: "Cabelos", revenue: 168 },
];

function CustomTooltipBar({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-neutral-200 rounded-xl shadow-elevated px-3 py-2 text-sm">
        <p className="text-neutral-500 text-xs mb-1">{label}</p>
        <p className="font-semibold text-neutral-800">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

export default function RelatoriosPage() {
  const totalRevenue = mockOrders
    .filter((o) => o.status !== "cancelado")
    .reduce((s, o) => s + o.total, 0);

  const avgTicket = mockOrders.length
    ? totalRevenue / mockOrders.filter((o) => o.status !== "cancelado").length
    : 0;

  const conversionRate = Math.round(
    (mockClients.filter((c) => c.status === "ativa").length / mockClients.length) * 100
  );

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Ticket Médio", value: formatCurrency(avgTicket), icon: ShoppingBag, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Total de Clientes", value: mockClients.length, icon: Users, color: "text-violet-500", bg: "bg-violet-50" },
          { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-neutral-800">{kpi.value}</p>
            <p className="text-sm text-neutral-500 mt-0.5">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDashboardStats.monthly_revenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip content={<CustomTooltipBar />} />
                <Bar dataKey="revenue" fill="#D4829C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie chart */}
        <Card>
          <CardHeader>
            <CardTitle>Por Categoria</CardTitle>
          </CardHeader>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryRevenue}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  dataKey="revenue"
                  paddingAngle={3}
                >
                  {categoryRevenue.map((_, i) => (
                    <Cell key={i} fill={ROSE_PALETTE[i % ROSE_PALETTE.length]} />
                  ))}
                </Pie>
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-neutral-600">{value}</span>}
                />
                <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top clients */}
      <Card>
        <CardHeader>
          <CardTitle>Melhores Clientes</CardTitle>
        </CardHeader>
        <div className="space-y-3">
          {mockClients
            .sort((a, b) => b.total_spent - a.total_spent)
            .slice(0, 5)
            .map((client, i) => {
              const maxSpent = mockClients[0].total_spent;
              return (
                <div key={client.id} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-neutral-400 w-4">{i + 1}</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">{client.name}</span>
                      <span className="text-sm font-bold text-neutral-800">{formatCurrency(client.total_spent)}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(client.total_spent / maxSpent) * 100}%`,
                          background: `${ROSE_PALETTE[i]}`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
