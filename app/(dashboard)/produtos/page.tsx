"use client";

import { useState } from "react";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { mockProducts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { LockedFeature } from "@/components/ui/LockedFeature";

const categories = ["Maquiagem", "Skincare", "Perfumaria", "Cabelos", "Corpo"];

export default function ProdutosPage() {
  const { canAdd, hasFeature, usage, setUsage } = usePlan();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "Maquiagem",
    cost_price: "",
    sale_price: "",
    stock: "",
  });

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  function handleAddClick() {
    if (!canAdd("products")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleAdd() {
    if (!form.name || !form.brand || !form.sale_price) return;
    const product: Product = {
      id: String(Date.now()),
      name: form.name,
      brand: form.brand,
      category: form.category,
      cost_price: Number(form.cost_price),
      sale_price: Number(form.sale_price),
      stock: Number(form.stock),
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [product, ...prev]);
    setUsage({ products: usage.products + 1 });
    setForm({ name: "", brand: "", category: "Maquiagem", cost_price: "", sale_price: "", stock: "" });
    setAddOpen(false);
  }

  const margin = (p: Product) =>
    p.cost_price > 0
      ? Math.round(((p.sale_price - p.cost_price) / p.sale_price) * 100)
      : null;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto ou marca..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          >
            <option value="all">Todas</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Produto</span>
          </Button>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Package className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
            <p className="text-neutral-400 text-sm">Nenhum produto encontrado</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {filtered.map((product) => {
            const m = margin(product);
            const lowStock = product.stock <= 5;
            return (
              <Card key={product.id} className="hover:shadow-elevated transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 text-rose-400" />
                  </div>
                  <Badge variant="gray" className="text-[10px] lg:text-xs">
                    {product.category}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-neutral-800 mb-0.5 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-xs text-neutral-400 mb-3">{product.brand}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500">Venda</span>
                    <span className="font-bold text-neutral-800">
                      {formatCurrency(product.sale_price)}
                    </span>
                  </div>
                  {m !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Margem</span>
                      <span className="font-medium text-emerald-600">{m}%</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {lowStock && hasFeature("stockAlerts") && (
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        lowStock && hasFeature("stockAlerts") ? "text-amber-600" : "text-neutral-500"
                      }`}
                    >
                      {product.stock} un.
                    </span>
                  </div>
                  {lowStock && (
                    hasFeature("stockAlerts") ? (
                      <Badge variant="yellow">Baixo</Badge>
                    ) : (
                      <LockedFeature feature="stockAlerts">
                        <Badge variant="gray">Estoque</Badge>
                      </LockedFeature>
                    )
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} resource="products" />

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Novo Produto">
        <div className="space-y-4">
          <Input
            label="Nome do produto *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Base Líquida Cobertura Total"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marca *"
              value={form.brand}
              onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Mary Kay, Avon..."
            />
            <Select
              label="Categoria"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Custo"
              value={form.cost_price}
              onChange={(e) => setForm((f) => ({ ...f, cost_price: e.target.value }))}
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Venda *"
              value={form.sale_price}
              onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value }))}
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Estoque"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          {form.cost_price && form.sale_price && Number(form.cost_price) > 0 && (
            <div className="bg-emerald-50 rounded-xl px-4 py-3 text-sm">
              <span className="text-neutral-600">Margem estimada: </span>
              <span className="font-bold text-emerald-600">
                {Math.round(
                  ((Number(form.sale_price) - Number(form.cost_price)) /
                    Number(form.sale_price)) *
                    100
                )}
                %
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleAdd}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
