"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  addProduto,
  updateProduto,
  deleteProduto,
} from "@/lib/actions/produtos";
import { getMovimentacoes, adicionarEstoque } from "@/lib/actions/estoque";
import { importProdutosCSV } from "@/lib/actions/csv";
import { parseFile, normalizeHeaders } from "@/lib/csv-parse";
import type { ImportProdutoRow } from "@/lib/actions/csv";
import {
  Plus,
  Package,
  AlertTriangle,
  Pencil,
  Trash2,
  Upload,
  FileText,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { SearchInput } from "@/components/ui/SearchInput";
import { Select } from "@/components/ui/Select";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Product, StockMovement } from "@/lib/types";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { cn } from "@/lib/utils";
import { usePagination } from "@/lib/use-pagination";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/ui/Toast";

const emptyForm = {
  name: "",
  brand: "",
  category: "",
  cost_price: "",
  sale_price: "",
  stock: "",
};

export function ProdutosView({
  initialProducts,
  categories,
}: {
  initialProducts: Product[];
  categories: string[];
}) {
  const router = useRouter();
  const { canAdd, hasFeature } = usePlan();
  const [isPending, startTransition] = useTransition();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [prevInitial, setPrevInitial] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState({
    ...emptyForm,
    category: categories[0] ?? "",
  });
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportProdutoRow[]>([]);
  const [importResult, setImportResult] = useState<{
    imported: number;
    skipped: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [stockAddOpen, setStockAddOpen] = useState(false);
  const [stockQty, setStockQty] = useState(1);
  const [stockMotivo, setStockMotivo] = useState("");

  // useEffect(() => {
  //   setProducts(initialProducts);
  // }, [initialProducts]);

  if (initialProducts !== prevInitial) {
    setPrevInitial(initialProducts);
    setProducts(initialProducts);
  }

  useEffect(() => {
    setStockAddOpen(false);
    setStockQty(1);
    setStockMotivo("");
  }, [detailProduct?.id]);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "all" || p.category === catFilter;
    return matchSearch && matchCat;
  });

  const { paginated, page, setPage, totalPages, totalItems, pageSize } =
    usePagination(filtered, 24, `${search}|${catFilter}`);

  function handleAddClick() {
    if (!canAdd("products")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleAdd() {
    if (!form.name || !form.sale_price) return;
    const snapshot = { ...form };
    const optimistic: Product = {
      id: `temp_${Date.now()}`,
      name: snapshot.name,
      brand: snapshot.brand,
      category: snapshot.category,
      cost_price: Number(snapshot.cost_price) || 0,
      sale_price: Number(snapshot.sale_price) || 0,
      stock: Number(snapshot.stock) || 0,
      created_at: new Date().toISOString(),
    };
    setProducts((prev) => [optimistic, ...prev]);
    setForm({ ...emptyForm, category: categories[0] ?? "" });
    setAddOpen(false);
    startTransition(async () => {
      const result = await addProduto(snapshot);
      if (result?.error) {
        setProducts((prev) => prev.filter((p) => p.id !== optimistic.id));
        setToast(result.error);
        return;
      }
      router.refresh();
    });
  }

  function openEdit(product: Product) {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      category: product.category,
      cost_price: product.cost_price > 0 ? String(product.cost_price) : "",
      sale_price: String(product.sale_price),
      stock: String(product.stock),
    });
    setDetailProduct(null);
    setEditOpen(true);
  }

  function handleEdit() {
    if (!editingProduct || !editForm.name || !editForm.sale_price) return;
    const id = editingProduct.id;
    const previous = editingProduct;
    const updated: Product = {
      ...editingProduct,
      name: editForm.name,
      brand: editForm.brand,
      category: editForm.category,
      cost_price: Number(editForm.cost_price) || 0,
      sale_price: Number(editForm.sale_price),
      stock: Number(editForm.stock) || 0,
    };
    setProducts((prev) => prev.map((p) => (p.id === id ? updated : p)));
    setEditOpen(false);
    startTransition(async () => {
      const result = await updateProduto(id, editForm);
      if (result?.error) {
        setProducts((prev) => prev.map((p) => (p.id === id ? previous : p)));
        setToast(result.error);
      }
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

  function handleAddStock() {
    if (!detailProduct || stockQty <= 0) return;
    startTransition(async () => {
      const result = await adicionarEstoque(
        detailProduct.id,
        stockQty,
        stockMotivo || undefined,
      );
      if (result.error) {
        setToast(result.error);
      } else {
        const newStock = result.newStock!;
        setDetailProduct((p) => (p ? { ...p, stock: newStock } : p));
        setProducts((prev) =>
          prev.map((p) =>
            p.id === detailProduct.id ? { ...p, stock: newStock } : p,
          ),
        );
        setStockAddOpen(false);
        setStockQty(1);
        setStockMotivo("");
      }
    });
  }

  async function openHistory(product: Product) {
    setDetailProduct(null);
    setHistoryOpen(true);
    setMovements([]);
    setMovementsLoading(true);
    const data = await getMovimentacoes(product.id);
    setMovements(data);
    setMovementsLoading(false);
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = await parseFile(file);
      const aliases = {
        name: ["nome", "name", "produto"],
        brand: ["marca", "brand"],
        category: ["categoria", "category"],
        cost_price: [
          "preco de custo",
          "preço de custo",
          "custo",
          "cost_price",
          "cost price",
        ],
        sale_price: [
          "preco de venda",
          "preço de venda",
          "venda",
          "sale_price",
          "sale price",
          "preco_venda",
        ],
        stock: ["estoque", "stock", "quantidade", "estoque_atual"],
      };
      const rows: ImportProdutoRow[] = parsed
        .map((r) => {
          const n = normalizeHeaders(r, aliases);
          return {
            name: n.name,
            brand: n.brand,
            category: n.category,
            cost_price: parseFloat(n.cost_price.replace(",", ".")) || 0,
            sale_price: parseFloat(n.sale_price.replace(",", ".")) || 0,
            stock: parseInt(n.stock) || 0,
          };
        })
        .filter((r) => r.name.trim() !== "");
      setImportRows(rows);
      setImportResult(null);
      setImportError(null);
    } catch {
      setImportError(
        "Não foi possível ler o arquivo. Verifique se é um CSV ou XLSX válido.",
      );
    }
  }

  function handleImportOpen() {
    if (!hasFeature("csvExport")) {
      setUpgradeOpen(true);
      return;
    }
    setImportOpen(true);
    setImportRows([]);
    setImportResult(null);
    setImportError(null);
  }

  async function handleImportConfirm() {
    setImportLoading(true);
    const result = await importProdutosCSV(importRows);
    setImportLoading(false);
    if (result.error) {
      setImportError(result.error);
    } else {
      setImportResult({ imported: result.imported, skipped: result.skipped });
      setImportRows([]);
      router.refresh();
    }
  }

  const margin = (p: Product) =>
    p.cost_price > 0
      ? Math.round(((p.sale_price - p.cost_price) / p.sale_price) * 100)
      : null;

  const tipoLabel = (m: StockMovement) => {
    if (m.tipo === "entrada")
      return {
        label: "Entrada",
        icon: ArrowUpCircle,
        color: "text-emerald-500",
      };
    if (m.tipo === "saida")
      return { label: "Saída", icon: ArrowDownCircle, color: "text-red-400" };
    return {
      label: "Ajuste",
      icon: SlidersHorizontal,
      color: "text-amber-500",
    };
  };

  const catOptions = categories.map((c) => ({ value: c, label: c }));

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchInput
          wrapperClassName="flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar produto ou marca..."
        />
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
          <button
            onClick={handleImportOpen}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-card"
          >
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">Importar</span>
          </button>
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
            <p className="text-neutral-400 text-sm">
              Nenhum produto encontrado
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
          {paginated.map((product) => {
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
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
                  {product.brand}
                </p>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Venda
                    </span>
                    <span className="font-bold text-neutral-800 dark:text-neutral-100">
                      {formatCurrency(product.sale_price)}
                    </span>
                  </div>
                  {m !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Margem
                      </span>
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
                      className={cn(
                        "text-xs font-medium",
                        lowStock && hasFeature("stockAlerts")
                          ? "text-amber-600"
                          : "text-neutral-500",
                      )}
                    >
                      {product.stock} un.
                    </span>
                  </div>
                  {lowStock &&
                    (hasFeature("stockAlerts") ? (
                      <Badge variant="yellow">Baixo</Badge>
                    ) : (
                      <LockedFeature feature="stockAlerts">
                        <Badge variant="gray">Estoque</Badge>
                      </LockedFeature>
                    ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {toast && (
        <Toast
          message={toast}
          variant="warning"
          onClose={() => setToast(null)}
        />
      )}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        resource="products"
      />

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Produto"
      >
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
              onChange={(e) =>
                setForm((f) => ({ ...f, brand: e.target.value }))
              }
              placeholder="Mary Kay, Avon..."
            />
            <Select
              label="Categoria"
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              options={catOptions}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Custo"
              value={form.cost_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, cost_price: e.target.value }))
              }
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Venda *"
              value={form.sale_price}
              onChange={(e) =>
                setForm((f) => ({ ...f, sale_price: e.target.value }))
              }
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Estoque"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          {form.cost_price &&
            form.sale_price &&
            Number(form.cost_price) > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Margem estimada:{" "}
                </span>
                <span className="font-bold text-emerald-600">
                  {Math.round(
                    ((Number(form.sale_price) - Number(form.cost_price)) /
                      Number(form.sale_price)) *
                      100,
                  )}
                  %
                </span>
              </div>
            )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setAddOpen(false)}
            >
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
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                  {detailProduct.brand}
                </p>
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
                  value:
                    detailProduct.cost_price > 0
                      ? formatCurrency(detailProduct.cost_price)
                      : "—",
                },
                {
                  label: "Margem",
                  value:
                    margin(detailProduct) !== null
                      ? `${margin(detailProduct)}%`
                      : "—",
                },
                {
                  label: "Estoque",
                  value: `${detailProduct.stock} unidades`,
                  warn: detailProduct.stock <= 5,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3"
                >
                  <p
                    className={cn(
                      "text-base font-bold",
                      s.highlight
                        ? "text-rose-600"
                        : s.warn
                          ? "text-amber-600"
                          : "text-neutral-800 dark:text-neutral-100",
                    )}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            {/* History button */}
            <button
              onClick={() => openHistory(detailProduct)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <History className="w-4 h-4" />
              Ver histórico de estoque
            </button>

            {/* Add stock */}
            {!confirmDelete &&
              (stockAddOpen ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl space-y-3">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                    Adicionar estoque
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setStockQty((q) => Math.max(1, q - 1))}
                      className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 flex items-center justify-center text-lg font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      −
                    </button>
                    <span className="text-xl font-bold text-neutral-800 dark:text-neutral-100 w-10 text-center">
                      {stockQty}
                    </span>
                    <button
                      onClick={() => setStockQty((q) => q + 1)}
                      className="w-9 h-9 rounded-xl border border-neutral-200 dark:border-neutral-600 bg-white dark:bg-neutral-800 flex items-center justify-center text-lg font-bold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      +
                    </button>
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      unidades
                    </span>
                  </div>
                  <input
                    type="text"
                    value={stockMotivo}
                    onChange={(e) => setStockMotivo(e.target.value)}
                    placeholder="Motivo (opcional)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setStockAddOpen(false);
                        setStockQty(1);
                        setStockMotivo("");
                      }}
                      className="flex-1 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddStock}
                      disabled={isPending}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {isPending ? "Salvando..." : `Confirmar +${stockQty}`}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setStockAddOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar estoque
                </button>
              ))}

            {/* Actions */}
            <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm text-center text-neutral-600 dark:text-neutral-300">
                    Excluir <strong>{detailProduct.name}</strong>? Esta ação não
                    pode ser desfeita.
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
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
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

      {/* Stock history modal */}
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Histórico de estoque"
      >
        <div className="space-y-3">
          {movementsLoading ? (
            <div className="py-10 flex items-center justify-center">
              <span className="w-6 h-6 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : movements.length === 0 ? (
            <div className="py-10 text-center">
              <History className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-sm text-neutral-400">
                Nenhuma movimentação registrada ainda.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {movements.map((m) => {
                const { label, icon: Icon, color } = tipoLabel(m);
                return (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl"
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", color)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {label} · {m.quantidade} un.
                      </p>
                      {m.motivo && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                          {m.motivo}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 shrink-0">
                      {formatDate(m.created_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar produtos"
        size="lg"
      >
        <div className="space-y-5">
          {importResult ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <Package className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                {importResult.imported} produto
                {importResult.imported !== 1 ? "s" : ""} importado
                {importResult.imported !== 1 ? "s" : ""}
              </p>
              {importResult.skipped > 0 && (
                <p className="text-sm text-neutral-400">
                  {importResult.skipped} linha
                  {importResult.skipped !== 1 ? "s" : ""} ignorada
                  {importResult.skipped !== 1 ? "s" : ""} (sem nome ou limite do
                  plano)
                </p>
              )}
              <button
                onClick={() => setImportOpen(false)}
                className="mt-4 px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    Formato esperado (cabeçalho na 1ª linha)
                  </p>
                </div>
                <code className="text-xs text-neutral-500 dark:text-neutral-400 block leading-relaxed">
                  Nome, Marca, Categoria, Preco de Custo, Preco de Venda,
                  Estoque
                </code>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  Preços com ponto ou vírgula como separador decimal
                </p>
              </div>

              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors group">
                <Upload className="w-8 h-8 text-neutral-300 dark:text-neutral-600 group-hover:text-rose-400 transition-colors" />
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
                    Clique para selecionar o arquivo
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                    Arquivo .csv (UTF-8) ou .xlsx
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              {importError && (
                <p className="text-sm text-red-500 text-center">
                  {importError}
                </p>
              )}

              {importRows.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {importRows.length} registro
                    {importRows.length !== 1 ? "s" : ""} encontrado
                    {importRows.length !== 1 ? "s" : ""} — prévia das primeiras
                    5 linhas:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <table className="min-w-full text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr>
                          {[
                            "Nome",
                            "Marca",
                            "Categoria",
                            "Custo",
                            "Venda",
                            "Estoque",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left font-semibold text-neutral-500 dark:text-neutral-400"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {importRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="bg-white dark:bg-neutral-900">
                            <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-30">
                              {r.name || "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                              {r.brand || "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                              {r.category || "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                              {r.cost_price > 0 ? `R$${r.cost_price}` : "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                              {r.sale_price > 0 ? `R$${r.sale_price}` : "—"}
                            </td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">
                              {r.stock}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setImportRows([]);
                        setImportError(null);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportConfirm}
                      disabled={importLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60"
                    >
                      {importLoading
                        ? "Importando..."
                        : `Importar ${importRows.length} produto${importRows.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Produto"
      >
        <div className="space-y-4">
          <Input
            label="Nome do produto *"
            value={editForm.name}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, name: e.target.value }))
            }
            placeholder="Ex: Base Líquida Cobertura Total"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Marca"
              value={editForm.brand}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, brand: e.target.value }))
              }
              placeholder="Mary Kay, Avon..."
            />
            <Select
              label="Categoria"
              value={editForm.category}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, category: e.target.value }))
              }
              options={catOptions}
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input
              label="Custo"
              value={editForm.cost_price}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, cost_price: e.target.value }))
              }
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Venda *"
              value={editForm.sale_price}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, sale_price: e.target.value }))
              }
              placeholder="0,00"
              type="number"
              min="0"
              step="0.01"
            />
            <Input
              label="Estoque"
              value={editForm.stock}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="0"
              type="number"
              min="0"
            />
          </div>

          {editForm.cost_price &&
            editForm.sale_price &&
            Number(editForm.cost_price) > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl px-4 py-3 text-sm">
                <span className="text-neutral-600 dark:text-neutral-400">
                  Margem estimada:{" "}
                </span>
                <span className="font-bold text-emerald-600">
                  {Math.round(
                    ((Number(editForm.sale_price) -
                      Number(editForm.cost_price)) /
                      Number(editForm.sale_price)) *
                      100,
                  )}
                  %
                </span>
              </div>
            )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleEdit}
              disabled={isPending}
            >
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
