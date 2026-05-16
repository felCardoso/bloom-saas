import { cn } from "@/lib/utils";

type BadgeVariant = "rose" | "green" | "yellow" | "gray" | "red" | "blue";

const variants: Record<BadgeVariant, string> = {
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  yellow: "bg-amber-50 text-amber-700 border-amber-200",
  gray: "bg-neutral-100 text-neutral-600 border-neutral-200",
  red: "bg-red-50 text-red-600 border-red-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
