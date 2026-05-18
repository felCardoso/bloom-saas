"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addProduto, updateProduto, deleteProduto } from "@/lib/actions/produtos";
import { Plus, Search, Package, AlertTriangle, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/lib/types";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { cn } from "@/lib/utils";

const categories = ["Maquiagem", "Skincare", "Perfumaria", "Cabelos", "Corpo"];

const emptyForm = {
  name: "",
  brand: "",
  category: "Maquiagem",
  cost_price: "",
  sale_price: "",
  stock: "",
};

export function ProdutosView({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const { canAdd, hasFeature } = usePlan();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

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
    if (!form.name || !form.sale_price) return;
    startTransition(async () => {
      await addProduto(form);
      setForm(emptyForm);
      setAddOpen(false);
      router.refresh();
    });
  }

  function openEdit(product: Product) {
    setEditForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      cost_price: product.cost_price > 0 ? String(product.cost_price) : "",
      sale_price: String(product.sale_price),
      stock: String(product.stock),
    });
    setEditOpen(true);
  }

  function handleEdit() {
    if (!detailProduct || !editForm.name || !editForm.sale_price) return;
    const id = detailProduct.id;
    startTransition(async () => {
      await updateProduto(id, editForm);
      const updated: Product = {
        ...detailProduct,
        name: editForm.name,
        brand: editForm.brand,
        category: editForm.category,
        cost_price: Number(editForm.cost_price) || 0,
        sale_price: Number(editForm.sale_price),
        stock: Number(editForm.stock) || 0,
      };
      setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
      setDetailProduct(updated);
      setEditOpen(false);
    });
  }

  function handleDelete() {
    if (!detailProduct) return;
    const id = detailProduct.id;
    startTransition(async () => {
      await deleteProduto(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setDetailProduct(null);
      setConfirmDelete(false);
    });
  }

  function handleCloseDetail() {
    setDetailProduct(null);
    setConfirmDelete(false);
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
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
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
              <button
                key={product.id}
                onClick={() => setDetailProduct(product)}
                className="text-left w-full bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card p-4 hover:shadow-elevated transition-shadow active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-9 h-9 lg:w-10 lg:h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 lg:w-5 lg:h-5 text-rose-400" />
                  </div>
                  <Badge variant="gray" className="text-[10px] lg:text-xs">
                    {product.category}
                  </Badge>
                </div>

                <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-0.5 line-clamp-2 text-left">
                  {product.name}
                </h3>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">{product.brand}</p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">Venda</span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-100">
                      {formatCurrency(product.sale_price)}
                    </span>
                  </div>
                  {m !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">Margem</span>
                      <span className="font-medium text-emerald-600">{m}%</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
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
              </button>
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
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Margem estimada: </span>
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
            <Button className="flex-1" onClick={handleAdd} disabled={isPending}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      {detailProduct && (
        <Modal
          open={!!detailProduct}
          onClose={handleCloseDetail}
          title={detailProduct.name}
        >
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center shrink-0">
                <Package className="w-7 h-7 text-rose-400" />
              </div>
              <div>
                <Badge variant="gray">{detailProduct.category}</Badge>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{detailProduct.brand}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  label: "Preço de venda",
                  value: formatCurrency(detailProduct.sale_price),
                  highlight: true,
                },
                {
                  label: "Custo",
                  value: detailProduct.cost_price > 0 ? formatCurrency(detailProduct.cost_price) : "—",
                },
                {
                  label: "Margem",
                  value: margin(detailProduct) !== null ? `${margin(detailProduct)}%` : "—",
                },
                {
                  label: "Estoque",
                  value: `${detailProduct.stock} unidades`,
                  warn: detailProduct.stock <= 5,
                },
              ].map((s) => (
                <div key={s.label} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                  <p
                    className={cn(
                      "text-base font-bold",
                      s.highlight
                        ? "text-rose-600"
                        : s.warn
                        ? "text-amber-600"
                        : "text-neutral-800 dark:text-neutral-100"
                    )}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm text-center text-neutral-600 dark:text-neutral-300">
                    Excluir <strong>{detailProduct.name}</strong>? Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancelar
                    </Button>
                    <button
                      onClick={handleDelete}
                      disabled={isPending}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                      {isPending ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir
                  </button>
                  <Button
                    className="flex-1"
                    onClick={() => openEdit(detailProduct)}
                  >
                    <Pencil className="w-4 h-4" />
                    Editar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar Produto">
        <div className="space-y-4">
          <Input
            label="Nome do produto *"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Base Líquida Cobertura Total"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marca"
              value={editForm.brand}
              onChange={(e) => setEditForm((f) => ({ ...f, brand: e.target.value }))}
              placeholder="Mary Kay, Avon..."
            />
            <Select
              label="Categoria"
              value={editForm.category}
              onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Custo"
              value={editForm.cost_price}
              onChange={(e) => setEditForm((f) => ({ ...f, cost_price: e.target.value }))}
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Venda *"
              value={editForm.sale_price}
              onChange={(e) => setEditForm((f) => ({ ...f, sale_price: e.target.value }))}
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Estoque"
              value={editForm.stock}
              onChange={(e) => setEditForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          {editForm.cost_price && editForm.sale_price && Number(editForm.cost_price) > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 text-sm">
              <span className="text-neutral-600 dark:text-neutral-400">Margem estimada: </span>
              <span className="font-bold text-emerald-600">
                {Math.round(
                  ((Number(editForm.sale_price) - Number(editForm.cost_price)) /
                    Number(editForm.sale_price)) *
                    100
                )}
                %
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleEdit} disabled={isPending}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
