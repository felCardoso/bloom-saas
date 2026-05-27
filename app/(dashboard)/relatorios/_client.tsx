"use client";

import { useState, useTransition } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Clock,
  Lock,
  ArrowRight,
  BarChart3,
} from "lucide-react";
import { usePlan } from "@/lib/plan-context";
import { useTheme, useThemeColor, useThemePalette } from "@/lib/theme-context";
import { LockedFeature } from "@/components/ui/LockedFeature";
import Link from "next/link";
import { getRelatorios } from "@/lib/actions/relatorios";
import type { RelatoriosData, Period } from "@/lib/actions/relatorios";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number; // Define que dentro do payload existe um 'value' numérico
  }>;
  label?: string;
}

const PERIOD_LABELS: Record<Period, string> = {
  "1m": "Este mês",
  "3m": "3 meses",
  "6m": "6 meses",
  "1y": "Este ano",
  all: "Tudo",
};

function valueSize(val: string): string {
  if (val.length <= 9) return "text-2xl";
  if (val.length <= 13) return "text-xl";
  return "text-lg";
}

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="h-48 flex flex-col items-center justify-center gap-2">
      <BarChart3 className="w-8 h-8 text-neutral-200 dark:text-neutral-700" />
      <p className="text-xs text-neutral-400 dark:text-neutral-500">{label}</p>
    </div>
  );
}

function CustomTooltipBar({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated px-3 py-2 text-sm">
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">
          {label}
        </p>
        <p className="font-semibold text-neutral-800 dark:text-neutral-100">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

function CustomTooltipCount({ active, payload, label }: CustomTooltipProps) {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated px-3 py-2 text-sm">
        <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-1">
          {label}
        </p>
        <p className="font-semibold text-neutral-800 dark:text-neutral-100">
          {payload[0].value} cliente{payload[0].value !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
}

function Delta({ current, prev }: { current: number; prev: number | null }) {
  if (prev === null || prev === 0) return null;
  const pct = ((current - prev) / prev) * 100;
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold",
        up ? "text-emerald-500" : "text-red-500",
      )}
    >
      {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {up ? "+" : ""}
      {pct.toFixed(1)}%
    </span>
  );
}

function LockedReportsGate() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
        <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
      </div>
      <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
        Relatórios disponíveis no Plus
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

export default function RelatoriosClient({
  data: initialData,
}: {
  data: RelatoriosData;
}) {
  const { hasFeature } = usePlan();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const palette = useThemePalette();
  const color500 = useThemeColor(500);
  const color700 = useThemeColor(700);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const conversionRate =
    data.totalClients > 0
      ? Math.round((data.activeClients / data.totalClients) * 100)
      : 0;

  function changePeriod(p: Period) {
    startTransition(async () => {
      const newData = await getRelatorios(p);
      setData(newData);
    });
  }

  if (!hasFeature("reportsBasic")) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card padding="none">
          <LockedReportsGate />
        </Card>
      </div>
    );
  }

  const kpis = [
    {
      label: "Receita Total",
      value: formatCurrency(data.totalRevenue),
      prev: data.prevTotalRevenue,
      current: data.totalRevenue,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(data.avgTicket),
      prev: data.prevAvgTicket,
      current: data.avgTicket,
      icon: ShoppingBag,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20",
    },
    {
      label: "Pedidos",
      value: String(data.totalOrders),
      prev: data.prevTotalOrders,
      current: data.totalOrders,
      icon: Package,
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-900/20",
    },
    {
      label: "Pendentes",
      value: String(data.pendingOrders),
      prev: null,
      current: data.pendingOrders,
      icon: Clock,
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      label: "Clientes Ativos",
      value: String(data.activeClients),
      prev: null,
      current: data.activeClients,
      icon: Users,
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-900/20",
    },
    {
      label: "Taxa de Conversão",
      value: `${conversionRate}%`,
      prev: null,
      current: conversionRate,
      icon: TrendingUp,
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-900/20",
    },
  ];

  return (
    <div
      className={cn(
        "space-y-4 lg:space-y-6 transition-opacity duration-200",
        isPending && "opacity-60 pointer-events-none",
      )}
    >
      {/* Period selector */}
      <div className="flex items-center gap-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => changePeriod(p)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              data.period === p
                ? "bg-rose-500 text-white shadow-sm"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800",
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <div
              className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                kpi.bg,
              )}
            >
              <kpi.icon className={cn("w-4 h-4", kpi.color)} />
            </div>
            <p
              className={cn(
                "font-bold text-neutral-800 dark:text-neutral-100 leading-tight break-all",
                valueSize(kpi.value),
              )}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {kpi.label}
            </p>
            {kpi.prev !== null && (
              <div className="mt-1.5">
                <Delta current={kpi.current} prev={kpi.prev} />
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          {data.monthlyRevenue.length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.monthlyRevenue}
                  margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#262626" : "#F3F4F6"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#9CA3AF" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `R$${v}`}
                  />
                  <Tooltip
                    cursor={{
                      fill: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.04)",
                    }}
                    content={<CustomTooltipBar />}
                  />
                  <Bar
                    dataKey="revenue"
                    fill={color500}
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Nenhuma venda no período" />
          )}
        </Card>

        {hasFeature("reportsAdvanced") ? (
          <Card>
            <CardHeader>
              <CardTitle>Por Categoria</CardTitle>
            </CardHeader>
            {data.categoryRevenue.length > 0 ? (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryRevenue}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={68}
                      dataKey="revenue"
                      paddingAngle={3}
                    >
                      {data.categoryRevenue.map((_, i) => (
                        <Cell
                          key={i}
                          fill={palette[i % palette.length]}
                          stroke={isDark ? "#171717" : "#ffffff"}
                        />
                      ))}
                    </Pie>
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-neutral-600 dark:text-neutral-400">
                          {value}
                        </span>
                      )}
                    />
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
              <CardHeader>
                <CardTitle>Por Categoria</CardTitle>
              </CardHeader>
              <EmptyChart label="Disponível no Premium" />
            </Card>
          </LockedFeature>
        )}
      </div>

      {/* New clients chart */}
      <Card>
        <CardHeader>
          <CardTitle>Novos Clientes por Mês</CardTitle>
        </CardHeader>
        {data.newClientsMonthly.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.newClientsMonthly}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? "#262626" : "#F3F4F6"}
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{
                    fill: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(0,0,0,0.04)",
                  }}
                  content={<CustomTooltipCount />}
                />
                <Bar dataKey="count" fill={color700} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyChart label="Nenhum cliente cadastrado no período" />
        )}
      </Card>

      {/* Top products (Premium) */}
      {hasFeature("reportsAdvanced") ? (
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          {data.topProducts.length > 0 ? (
            <div className="space-y-3">
              {data.topProducts.map((product, i) => {
                const maxRev = data.topProducts[0].revenue;
                return (
                  <div key={product.name} className="flex items-center gap-4">
                    <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 w-4">
                      {i + 1}
                    </span>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {product.name}
                        </span>
                        <div className="text-right">
                          <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                            {formatCurrency(product.revenue)}
                          </span>
                          <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-2">
                            {product.quantity}×
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(product.revenue / maxRev) * 100}%`,
                            background: palette[i % palette.length],
                          }}
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
                Nenhuma venda registrada no período.
              </p>
            </div>
          )}
        </Card>
      ) : (
        <LockedFeature feature="reportsAdvanced" blurred>
          <Card>
            <CardHeader>
              <CardTitle>Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <div className="py-8 text-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                Disponível no Premium
              </p>
            </div>
          </Card>
        </LockedFeature>
      )}

      {/* Top clients */}
      <Card>
        <CardHeader>
          <CardTitle>Melhores Clientes</CardTitle>
        </CardHeader>
        {data.topClients.length > 0 ? (
          <div className="space-y-3">
            {data.topClients.map((client, i) => {
              const maxSpent = data.topClients[0].total_spent;
              return (
                <div key={client.id} className="flex items-center gap-4">
                  <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500 w-4">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {client.name}
                      </span>
                      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
                        {formatCurrency(client.total_spent)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(client.total_spent / maxSpent) * 100}%`,
                          background: palette[i % palette.length],
                        }}
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
              {data.totalClients > 0
                ? "Nenhuma venda no período."
                : "Adicione clientes e registre vendas para ver o ranking."}
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
              <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                Relatórios avançados no Premium
              </p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                Análise por categoria, produtos mais vendidos e métricas de
                crescimento.
              </p>
            </div>
            <Link
              href="/pricing"
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-xs font-semibold hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
            >
              Ver Premium <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
