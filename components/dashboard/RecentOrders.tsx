import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus } from "@/lib/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const statusMap: Record<OrderStatus, { label: string; variant: "rose" | "green" | "yellow" | "gray" | "red" | "blue" }> = {
  pendente: { label: "Pendente", variant: "yellow" },
  confirmado: { label: "Confirmado", variant: "blue" },
  entregue: { label: "Entregue", variant: "green" },
  cancelado: { label: "Cancelado", variant: "red" },
};

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card padding="none">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-neutral-800">Pedidos Recentes</h3>
        <Link
          href="/pedidos"
          className="text-xs text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
        >
          Ver todos <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="divide-y divide-neutral-100">
        {orders.map((order) => {
          const status = statusMap[order.status];
          return (
            <div key={order.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-neutral-50 transition-colors">
              <Avatar name={order.client_name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-800 truncate">
                  {order.client_name}
                </p>
                <p className="text-xs text-neutral-400">
                  {order.items.length} {order.items.length === 1 ? "item" : "itens"} · {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-neutral-800">
                  {formatCurrency(order.total)}
                </p>
                <Badge variant={status.variant} className="mt-0.5">
                  {status.label}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
