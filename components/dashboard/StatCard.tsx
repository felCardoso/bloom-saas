import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: number;
  iconColor?: string;
  iconBg?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = "text-rose-500",
  iconBg = "bg-rose-50",
}: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-4 lg:p-5">
      <div className="flex items-start justify-between mb-3 lg:mb-4">
        <div className={cn("w-9 h-9 lg:w-10 lg:h-10 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className={cn("w-4 h-4 lg:w-5 lg:h-5", iconColor)} />
        </div>
        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-[11px] lg:text-xs font-medium px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-lg",
              positive ? "text-emerald-600 bg-emerald-50" : "text-red-500 bg-red-50"
            )}
          >
            {positive ? <TrendingUp className="w-2.5 h-2.5 lg:w-3 lg:h-3" /> : <TrendingDown className="w-2.5 h-2.5 lg:w-3 lg:h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-xl lg:text-2xl font-bold text-neutral-800 mb-0.5">{value}</p>
      <p className="text-xs lg:text-sm font-medium text-neutral-600">{title}</p>
      {subtitle && <p className="text-[11px] lg:text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}
