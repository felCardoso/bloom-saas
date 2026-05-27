"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useThemeColor } from "@/lib/theme-context";

interface DataPoint {
  month: string;
  revenue: number;
}

interface RevenueChartProps {
  data: DataPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-elevated px-3 py-2">
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function RevenueChart({ data }: RevenueChartProps) {
  const color500 = useThemeColor(500);
  const color600 = useThemeColor(600);

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Receita dos Últimos 6 Meses</CardTitle>
        <span className="text-xs text-neutral-400">Em reais (R$)</span>
      </CardHeader>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color500} stopOpacity={0.15} />
                <stop offset="95%" stopColor={color500} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
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
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={color500}
              strokeWidth={2.5}
              fill="url(#primaryGrad)"
              dot={{ fill: color500, strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, fill: color600, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
