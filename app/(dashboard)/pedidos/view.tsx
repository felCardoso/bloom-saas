"use client";

import { useState, useTransition } from "react"; // useEffect
import { useRouter } from "next/navigation";
import {
  addVenda,
  updateVendaStatus,
  deleteVenda,
  confirmPayment,
} from "@/lib/actions/vendas";
import { Plus, Search, ShoppingBag, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Toast } from "@/components/ui/Toast";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import type {
  Order,
  OrderStatus,
  OrderItem,
  Client,
  Product,
  PaymentMethod,
} from "@/lib/types";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { usePagination } from "@/lib/use-pagination";
import { Pagination } from "@/components/ui/Pagination";
import { isOrderPaid, isOrderPendingRevenue } from "@/lib/order-utils";

const statusMap: Record<
  OrderStatus,
  {
    label: string;
    variant: "rose" | "green" | "yellow" | "gray" | "red" | "blue";
  }
> = {
  pendente: { label: "Pendente", variant: "yellow" },
  confirmado: { label: "Confirmado", variant: "blue" },
  entregue: { label: "Entregue", variant: "green" },
  cancelado: { label: "Cancelado", variant: "red" },
};

const paymentLabels: Record<PaymentMethod, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  fiado: "Fiado",
};

export function PedidosView({
  initialOrders,
  clients,
  products,
}: {
  initialOrders: Order[];
  clients: Client[];
  products: Product[];
}) {
  const router = useRouter();
  const { canAdd } = usePlan();
  const [isPending, startTransition] = useTransition();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [prevInitial, setPrevInitial] = useState(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newOrder, setNewOrder] = useState({
    client_id: "",
    status: "pendente" as OrderStatus,
    payment_method: "dinheiro" as PaymentMethod,
    notes: "",
    items: [] as OrderItem[],
  });
  const [addingProductId, setAddingProductId] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  // useEffect(() => {
  //   setOrders(initialOrders);
  // }, [initialOrders]);

  if (initialOrders !== prevInitial) {
    setPrevInitial(initialOrders);
    setOrders(initialOrders);
  }

  const filtered = orders.filter((o) => {
    const matchSearch = o.client_name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const { paginated, page, setPage, totalPages, totalItems, pageSize } =
    usePagination(filtered, 20, `${search}|${statusFilter}`);

  function addOrIncrement(productId: string) {
    if (!productId) return;
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (product.stock === 0) {
      setToast("Produto sem estoque disponível.");
      setAddingProductId("");
      return;
    }
    const existing = newOrder.items.find((i) => i.product_id === productId);
    const currentQty = existing?.quantity ?? 0;
    const available = product.stock - currentQty;
    if (available <= 0) {
      setToast(
        `Estoque insuficiente. Disponível: ${product.stock} unidade(s).`,
      );
      setAddingProductId("");
      return;
    }
    if (existing) {
      setNewOrder((o) => ({
        ...o,
        items: o.items.map((i) =>
          i.product_id === productId
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: i.unit_price * (i.quantity + 1),
              }
            : i,
        ),
      }));
    } else {
      const item: OrderItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.sale_price,
        subtotal: product.sale_price,
      };
      setNewOrder((o) => ({ ...o, items: [...o.items, item] }));
    }
    setAddingProductId("");
  }

  function changeItemQty(productId: string, delta: number) {
    const existing = newOrder.items.find((i) => i.product_id === productId);
    if (!existing) return;
    const newQty = existing.quantity + delta;
    if (newQty <= 0) {
      setNewOrder((o) => ({
        ...o,
        items: o.items.filter((i) => i.product_id !== productId),
      }));
      return;
    }
    if (delta > 0) {
      const product = products.find((p) => p.id === productId);
      if (product && newQty > product.stock) {
        setToast(
          `Estoque insuficiente. Disponível: ${product.stock} unidade(s).`,
        );
        return;
      }
    }
    setNewOrder((o) => ({
      ...o,
      items: o.items.map((i) =>
        i.product_id === productId
          ? { ...i, quantity: newQty, subtotal: i.unit_price * newQty }
          : i,
      ),
    }));
  }

  function handleAddClick() {
    if (!canAdd("ordersPerMonth")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleCreate() {
    if (!newOrder.client_id || newOrder.items.length === 0) return;
    const snapshot = { ...newOrder, items: [...newOrder.items] };
    const client = clients.find((c) => c.id === snapshot.client_id);
    const total = snapshot.items.reduce((s, i) => s + i.subtotal, 0);
    const optimistic: Order = {
      id: `temp_${Date.now()}`,
      client_id: snapshot.client_id,
      client_name: client?.name ?? "—",
      items: snapshot.items,
      total,
      status: snapshot.status,
      payment_method: snapshot.payment_method,
      notes: snapshot.notes || undefined,
      created_at: new Date().toISOString(),
    };
    setOrders((prev) => [optimistic, ...prev]);
    setNewOrder({
      client_id: "",
      status: "pendente",
      payment_method: "dinheiro",
      notes: "",
      items: [],
    });
    setAddingProductId("");
    setAddOpen(false);
    startTransition(async () => {
      const result = await addVenda(snapshot);
      if (result?.error) {
        setOrders((prev) => prev.filter((o) => o.id !== optimistic.id));
        setToast(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : s));
    startTransition(async () => {
      await updateVendaStatus(id, status);
    });
  }

  function handleConfirmPayment(id: string) {
    const now = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, paid_at: now } : o)),
    );
    if (selected?.id === id)
      setSelected((s) => (s ? { ...s, paid_at: now } : s));
    startTransition(async () => {
      await confirmPayment(id);
    });
  }

  function handleDelete() {
    if (!selected) return;
    const id = selected.id;
    startTransition(async () => {
      await deleteVenda(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelected(null);
      setConfirmDelete(false);
    });
  }

  function handleCloseDetail() {
    setSelected(null);
    setConfirmDelete(false);
  }

  const confirmedRevenue = filtered
    .filter(isOrderPaid)
    .reduce((s, o) => s + o.total, 0);

  const pendingRevenue = filtered
    .filter(isOrderPendingRevenue)
    .reduce((s, o) => s + o.total, 0);

  const isFiadoPending = (o: Order) =>
    o.payment_method === "fiado" && o.status === "entregue" && !o.paid_at;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          >
            <option value="all">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="confirmado">Confirmado</option>
            <option value="entregue">Entregue</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <Button onClick={handleAddClick}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Novo Pedido</span>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Pedidos", value: filtered.length },
          {
            label: "Pendentes",
            value: filtered.filter((o) => o.status === "pendente").length,
          },
          {
            label: "Receita",
            value: formatCurrency(confirmedRevenue),
            accent: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Receita pendente",
            value: formatCurrency(pendingRevenue),
            accent: "text-amber-600 dark:text-amber-400",
          },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p
              className={cn(
                "text-lg lg:text-xl font-bold",
                s.accent ?? "text-neutral-800 dark:text-neutral-100",
              )}
            >
              {s.value}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {s.label}
            </p>
          </Card>
        ))}
      </div>

      {/* Order list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-neutral-400 text-sm">
                Nenhum pedido encontrado
              </p>
            </div>
          </Card>
        ) : (
          paginated.map((order) => {
            const status = statusMap[order.status];
            const fiadoPending = isFiadoPending(order);
            return (
              <Card
                key={order.id}
                padding="none"
                className="hover:shadow-elevated transition-shadow overflow-hidden"
              >
                <div
                  className="flex items-start sm:items-center gap-3 px-4 py-4 cursor-pointer"
                  onClick={() => setSelected(order)}
                >
                  <Avatar name={order.client_name} className="mt-0.5 sm:mt-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        {order.client_name}
                      </p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {fiadoPending && (
                        <Badge variant="yellow">Fiado pendente</Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                    <div className="flex items-center gap-x-2 flex-wrap mt-0.5">
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </p>
                      <span className="text-xs text-neutral-300 dark:text-neutral-600">
                        ·
                      </span>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 whitespace-nowrap">
                        {paymentLabels[order.payment_method]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                      {order.items.length}{" "}
                      {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                {(order.status === "pendente" ||
                  order.status === "confirmado" ||
                  fiadoPending) && (
                  <div
                    className="border-t border-neutral-100 dark:border-neutral-800 px-4 py-2.5 flex gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.status === "pendente" && (
                      <>
                        <button
                          onClick={() => updateStatus(order.id, "cancelado")}
                          className="flex-1 text-xs py-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 font-medium transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => updateStatus(order.id, "confirmado")}
                          className="flex-1 text-xs py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium transition-colors"
                        >
                          Confirmar
                        </button>
                      </>
                    )}
                    {order.status === "confirmado" && (
                      <button
                        onClick={() => updateStatus(order.id, "entregue")}
                        className="flex-1 text-xs py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-medium transition-colors"
                      >
                        Marcar como Entregue
                      </button>
                    )}
                    {fiadoPending && (
                      <button
                        onClick={() => handleConfirmPayment(order.id)}
                        className="flex-1 text-xs py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/50 font-medium transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Pagamento recebido
                      </button>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

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
        resource="ordersPerMonth"
      />

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Pedido"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Cliente *"
            value={newOrder.client_id}
            onChange={(e) =>
              setNewOrder((o) => ({ ...o, client_id: e.target.value }))
            }
            options={clients.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecione a cliente"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Status inicial"
              value={newOrder.status}
              onChange={(e) =>
                setNewOrder((o) => ({
                  ...o,
                  status: e.target.value as OrderStatus,
                }))
              }
              options={[
                { value: "pendente", label: "Pendente" },
                { value: "confirmado", label: "Confirmado" },
                { value: "entregue", label: "Entregue" },
              ]}
            />
            <Select
              label="Forma de pagamento"
              value={newOrder.payment_method}
              onChange={(e) =>
                setNewOrder((o) => ({
                  ...o,
                  payment_method: e.target.value as PaymentMethod,
                }))
              }
              options={[
                { value: "dinheiro", label: "Dinheiro" },
                { value: "pix", label: "PIX" },
                { value: "cartao_credito", label: "Cartão de Crédito" },
                { value: "cartao_debito", label: "Cartão de Débito" },
                { value: "fiado", label: "Fiado" },
              ]}
            />
          </div>

          {newOrder.payment_method === "fiado" && (
            <div className="px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl text-sm text-amber-700 dark:text-amber-400">
              Pedido registrado como fiado. Um botão de confirmação de pagamento
              aparecerá após a entrega.
            </div>
          )}

          {/* Add item */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl space-y-3">
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Adicionar Produto
            </p>
            <select
              value={addingProductId}
              onChange={(e) => addOrIncrement(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-sm text-neutral-800 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              <option value="">Selecione o produto para adicionar...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.stock === 0}>
                  {p.name} — {formatCurrency(p.sale_price)}
                  {p.stock === 0 ? " (sem estoque)" : ` (${p.stock} un.)`}
                </option>
              ))}
            </select>

            {newOrder.items.length > 0 && (
              <div className="space-y-2 pt-1">
                {newOrder.items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-2 bg-white dark:bg-neutral-900 rounded-xl px-3 py-2.5 border border-neutral-100 dark:border-neutral-700"
                  >
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 truncate flex-1 min-w-0">
                      {item.product_name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => changeItemQty(item.product_id, -1)}
                        className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        −
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => changeItemQty(item.product_id, 1)}
                        className="w-7 h-7 rounded-lg border border-neutral-200 dark:border-neutral-600 flex items-center justify-center text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 whitespace-nowrap ml-1">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 text-sm font-bold text-neutral-800 dark:text-neutral-100 border-t border-neutral-200 dark:border-neutral-700">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      newOrder.items.reduce((s, i) => s + i.subtotal, 0),
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Observações
            </label>
            <textarea
              value={newOrder.notes}
              onChange={(e) =>
                setNewOrder((o) => ({ ...o, notes: e.target.value }))
              }
              rows={2}
              placeholder="Endereço de entrega, notas especiais..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setAddOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleCreate}>
              Criar Pedido
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      {selected && (
        <Modal
          open={!!selected}
          onClose={handleCloseDetail}
          title={`Pedido de ${selected.client_name}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.client_name} />
              <div className="flex-1">
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">
                  {selected.client_name}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {formatDate(selected.created_at)}
                </p>
              </div>
              <Badge variant={statusMap[selected.status].variant}>
                {statusMap[selected.status].label}
              </Badge>
            </div>

            {/* Payment method */}
            <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                Forma de pagamento
              </span>
              <span
                className={`text-sm font-semibold ${selected.payment_method === "fiado" ? "text-amber-600 dark:text-amber-400" : "text-neutral-800 dark:text-neutral-100"}`}
              >
                {paymentLabels[selected.payment_method]}
                {selected.payment_method === "fiado" && selected.paid_at && (
                  <span className="ml-2 text-xs font-normal text-emerald-600 dark:text-emerald-400">
                    · Pago em {formatDate(selected.paid_at)}
                  </span>
                )}
              </span>
            </div>

            {/* Fiado pending alert */}
            {isFiadoPending(selected) && (
              <div className="flex items-center justify-between px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl gap-3">
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Pagamento ainda não confirmado.
                </p>
                <button
                  onClick={() => handleConfirmPayment(selected.id)}
                  disabled={isPending}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Confirmar pagamento
                </button>
              </div>
            )}

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl p-4 space-y-2.5">
              {selected.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-neutral-700 dark:text-neutral-300 flex-1 mr-2 truncate">
                    {item.product_name}
                  </span>
                  <span className="text-neutral-400 dark:text-neutral-500 mr-3">
                    ×{item.quantity}
                  </span>
                  <span className="font-medium text-neutral-800 dark:text-neutral-100 whitespace-nowrap">
                    {formatCurrency(item.subtotal)}
                  </span>
                </div>
              ))}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-2.5 flex justify-between font-bold text-neutral-800 dark:text-neutral-100">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </div>
            </div>

            {selected.notes && (
              <p className="text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3">
                {selected.notes}
              </p>
            )}

            {selected.status !== "entregue" &&
              selected.status !== "cancelado" && (
                <div className="flex gap-2">
                  {selected.status === "pendente" && (
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => updateStatus(selected.id, "cancelado")}
                    >
                      Cancelar Pedido
                    </Button>
                  )}
                  <Button
                    className="flex-1"
                    onClick={() =>
                      updateStatus(
                        selected.id,
                        selected.status === "pendente"
                          ? "confirmado"
                          : "entregue",
                      )
                    }
                  >
                    {selected.status === "pendente"
                      ? "Confirmar"
                      : "Marcar Entregue"}
                  </Button>
                </div>
              )}

            {/* Delete section */}
            <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm text-center text-neutral-600 dark:text-neutral-300">
                    Excluir este pedido? Esta ação não pode ser desfeita.
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
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir pedido
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
