import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

interface Product {
  name: string;
  quantity: number;
  revenue: number;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  const max = Math.max(...products.map((p) => p.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produtos Mais Vendidos</CardTitle>
      </CardHeader>
      <div className="space-y-3">
        {products.map((product, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate pr-2">
                {product.name}
              </span>
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 whitespace-nowrap">
                {formatCurrency(product.revenue)}
              </span>
            </div>
            <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full transition-all"
                style={{ width: `${(product.revenue / max) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">{product.quantity} unidades</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
