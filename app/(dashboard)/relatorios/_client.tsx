"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Users, ShoppingBag, DollarSign, Lock, ArrowRight, BarChart3 } from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { useTheme } from "@/lib/theme-context";
import { LockedFeature } from "@/components/ui/LockedFeature";
import Link from "next/link";
import type { RelatoriosData } from "@/lib/actions/relatorios";

const ROSE_PALETTE = ["#D4829C", "#E8A4B8", "#A85C78", "#F2C4D4", "#8C4D65"];

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-56 flex flex-col items-center justify-center gap-2">
      <BarChart3 className="w-8 h-8 text-neutral-200 dark:text-neutral-700" />
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{label}</p>
    </div>
  );
}

function CustomTooltipBar({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated px-3 py-2 text-sm">
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">{label}</p>
        <p className="font-semibold text-neutral-800 dark:text-neutral-100">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

function LockedReportsGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
        Relatórios disponíveis no Pro
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
        Acesse gráficos de receita, análise por categoria e ranking de melhores
        clientes para tomar decisões mais inteligentes.
      </p>
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
      >
        Ver planos <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function RelatoriosClient({ data }: { data: RelatoriosData }) {
  const { hasFeature } = usePlan();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const conversionRate = data.totalClients > 0
    ? Math.round((data.activeClients / data.totalClients) * 100)
    : 0;

  const hasOrders = data.monthlyRevenue.length > 0;
  const hasClients = data.totalClients > 0;
  const hasCategories = data.categoryRevenue.length > 0;
  const hasTopClients = data.topClients.length > 0;

  if (!hasFeature("reportsBasic")) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="none">
          <LockedReportsGate />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: "Receita Total", value: formatCurrency(data.totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Ticket Médio", value: formatCurrency(data.avgTicket), icon: ShoppingBag, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
          { label: "Total de Clientes", value: data.totalClients, icon: Users, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/20" },
          { label: "Taxa de Conversão", value: `${conversionRate}%`, icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-2xl font-bold text-neutral-800 dark:text-neutral-100">{kpi.value}</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{kpi.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          {hasOrders ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyRevenue} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#262626" : "#F3F4F6"} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                  <Tooltip cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)" }} content={<CustomTooltipBar />} />
                  <Bar dataKey="revenue" fill="#D4829C" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Nenhuma venda registrada ainda" />
          )}
        </Card>

        {hasFeature("reportsAdvanced") ? (
          <Card>
            <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
            {hasCategories ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.categoryRevenue} cx="50%" cy="45%" innerRadius={50} outerRadius={75} dataKey="revenue" paddingAngle={3}>
                      {data.categoryRevenue.map((_, i) => (
                        <Cell key={i} fill={ROSE_PALETTE[i % ROSE_PALETTE.length]} stroke={isDark ? "#171717" : "#ffffff"} />
                      ))}
                    </Pie>
                    <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-neutral-600">{value}</span>} />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart label="Nenhuma venda por categoria" />
            )}
          </Card>
        ) : (
          <LockedFeature feature="reportsAdvanced" blurred>
            <Card>
              <CardHeader><CardTitle>Por Categoria</CardTitle></CardHeader>
              <EmptyChart label="Disponível no Premium" />
            </Card>
          </LockedFeature>
        )}
      </div>

      {/* Top clients */}
      <Card>
        <CardHeader><CardTitle>Melhores Clientes</CardTitle></CardHeader>
        {hasTopClients ? (
          <div className="space-y-3">
            {data.topClients.map((client, i) => {
              const maxSpent = data.topClients[0].total_spent;
              return (
                <div key={client.id} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 w-4">{i + 1}</span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{client.name}</span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">{formatCurrency(client.total_spent)}</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(client.total_spent / maxSpent) * 100}%`, background: ROSE_PALETTE[i] }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-neutral-400 dark:text-neutral-500">
              {hasClients ? "Nenhuma venda registrada ainda." : "Adicione clientes e registre vendas para ver o ranking."}
            </p>
          </div>
        )}
      </Card>

      {!hasFeature("reportsAdvanced") && (
        <Card className="border-dashed border-neutral-300">
          <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
            <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Relatórios avançados no Premium</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                Análise por categoria, comparativo de períodos e métricas de crescimento.
              </p>
            </div>
            <Link href="/pricing" className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-700 transition-colors">
              Ver Premium <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
