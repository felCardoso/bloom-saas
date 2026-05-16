"use client";

import { useState } from "react";
import { Plus, Search, ShoppingBag, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { mockOrders, mockClients, mockProducts } from "@/lib/mock-data";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Order, OrderStatus, OrderItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusMap: Record<OrderStatus, { label: string; variant: "rose" | "green" | "yellow" | "gray" | "red" | "blue" }> = {
  pendente: { label: "Pendente", variant: "yellow" },
  confirmado: { label: "Confirmado", variant: "blue" },
  entregue: { label: "Entregue", variant: "green" },
  cancelado: { label: "Cancelado", variant: "red" },
};

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({
    client_id: "",
    status: "pendente" as OrderStatus,
    notes: "",
    items: [] as OrderItem[],
  });
  const [addingItem, setAddingItem] = useState({ product_id: "", quantity: 1 });

  const filtered = orders.filter((o) => {
    const matchSearch = o.client_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function addItem() {
    const product = mockProducts.find((p) => p.id === addingItem.product_id);
    if (!product) return;
    const item: OrderItem = {
      product_id: product.id,
      product_name: product.name,
      quantity: addingItem.quantity,
      unit_price: product.sale_price,
      subtotal: product.sale_price * addingItem.quantity,
    };
    setNewOrder((o) => ({ ...o, items: [...o.items, item] }));
    setAddingItem({ product_id: "", quantity: 1 });
  }

  function handleCreate() {
    if (!newOrder.client_id || newOrder.items.length === 0) return;
    const client = mockClients.find((c) => c.id === newOrder.client_id);
    if (!client) return;
    const total = newOrder.items.reduce((s, i) => s + i.subtotal, 0);
    const order: Order = {
      id: String(Date.now()),
      client_id: client.id,
      client_name: client.name,
      items: newOrder.items,
      total,
      status: newOrder.status,
      notes: newOrder.notes,
      created_at: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    setNewOrder({ client_id: "", status: "pendente", notes: "", items: [] });
    setAddOpen(false);
  }

  function updateStatus(id: string, status: OrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    if (selected?.id === id) setSelected((s) => s ? { ...s, status } : s);
  }

  const totalRevenue = filtered.reduce((s, o) => s + (o.status !== "cancelado" ? o.total : 0), 0);

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
        >
          <option value="all">Todos</option>
          <option value="pendente">Pendente</option>
          <option value="confirmado">Confirmado</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Novo Pedido
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Pedidos", value: filtered.length },
          { label: "Pendentes", value: filtered.filter((o) => o.status === "pendente").length },
          { label: "Entregues", value: filtered.filter((o) => o.status === "entregue").length },
          { label: "Receita", value: formatCurrency(totalRevenue) },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className="text-xl font-bold text-neutral-800">{s.value}</p>
            <p className="text-xs text-neutral-500">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-neutral-400 text-sm">Nenhum pedido encontrado</p>
            </div>
          </Card>
        ) : (
          filtered.map((order) => {
            const status = statusMap[order.status];
            return (
              <Card
                key={order.id}
                padding="none"
                className="hover:shadow-elevated transition-shadow cursor-pointer"
              >
                <div
                  className="flex items-center gap-4 px-5 py-4"
                  onClick={() => setSelected(order)}
                >
                  <Avatar name={order.client_name} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-neutral-800">{order.client_name}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {order.items.map((i) => i.product_name).join(", ")}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-neutral-800">{formatCurrency(order.total)}</p>
                    <p className="text-xs text-neutral-400">
                      {order.items.length} {order.items.length === 1 ? "item" : "itens"}
                    </p>
                  </div>

                  {/* Quick status change */}
                  <div
                    className="flex gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {order.status === "pendente" && (
                      <button
                        onClick={() => updateStatus(order.id, "confirmado")}
                        className="text-[11px] px-2.5 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                      >
                        Confirmar
                      </button>
                    )}
                    {order.status === "confirmado" && (
                      <button
                        onClick={() => updateStatus(order.id, "entregue")}
                        className="text-[11px] px-2.5 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 font-medium transition-colors"
                      >
                        Entregue
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Novo Pedido" size="lg">
        <div className="space-y-4">
          <Select
            label="Cliente *"
            value={newOrder.client_id}
            onChange={(e) => setNewOrder((o) => ({ ...o, client_id: e.target.value }))}
            options={mockClients.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecione a cliente"
          />
          <Select
            label="Status"
            value={newOrder.status}
            onChange={(e) => setNewOrder((o) => ({ ...o, status: e.target.value as OrderStatus }))}
            options={[
              { value: "pendente", label: "Pendente" },
              { value: "confirmado", label: "Confirmado" },
              { value: "entregue", label: "Entregue" },
            ]}
          />

          {/* Add item */}
          <div className="p-4 bg-neutral-50 rounded-xl space-y-3">
            <p className="text-sm font-medium text-neutral-700">Adicionar Produto</p>
            <div className="flex gap-2">
              <select
                value={addingItem.product_id}
                onChange={(e) => setAddingItem((i) => ({ ...i, product_id: e.target.value }))}
                className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              >
                <option value="">Selecione o produto</option>
                {mockProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.sale_price)}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={addingItem.quantity}
                onChange={(e) => setAddingItem((i) => ({ ...i, quantity: Number(e.target.value) }))}
                className="w-16 px-3 py-2 rounded-xl border border-neutral-200 bg-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              <Button variant="secondary" size="sm" onClick={addItem}>
                Adicionar
              </Button>
            </div>

            {/* Items list */}
            {newOrder.items.length > 0 && (
              <div className="space-y-2 pt-1">
                {newOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-2 border border-neutral-100">
                    <span className="text-neutral-700">{item.product_name}</span>
                    <span className="text-neutral-500">×{item.quantity}</span>
                    <span className="font-semibold text-neutral-800">{formatCurrency(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 text-sm font-bold text-neutral-800 border-t border-neutral-200">
                  <span>Total</span>
                  <span>{formatCurrency(newOrder.items.reduce((s, i) => s + i.subtotal, 0))}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Observações</label>
            <textarea
              value={newOrder.notes}
              onChange={(e) => setNewOrder((o) => ({ ...o, notes: e.target.value }))}
              rows={2}
              placeholder="Forma de pagamento, endereço de entrega..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <Button variant="secondary" className="flex-1" onClick={() => setAddOpen(false)}>Cancelar</Button>
            <Button className="flex-1" onClick={handleCreate}>Criar Pedido</Button>
          </div>
        </div>
      </Modal>

      {/* Detail modal */}
      {selected && (
        <Modal open={!!selected} onClose={() => setSelected(null)} title={`Pedido #${selected.id}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar name={selected.client_name} />
              <div>
                <p className="font-semibold text-neutral-800">{selected.client_name}</p>
                <p className="text-xs text-neutral-400">{formatDate(selected.created_at)}</p>
              </div>
              <Badge variant={statusMap[selected.status].variant} className="ml-auto">
                {statusMap[selected.status].label}
              </Badge>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 space-y-2">
              {selected.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-neutral-700">{item.product_name}</span>
                  <div className="flex items-center gap-4 text-neutral-500">
                    <span>×{item.quantity}</span>
                    <span className="w-20 text-right font-medium text-neutral-800">{formatCurrency(item.subtotal)}</span>
                  </div>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-2 flex justify-between font-bold text-neutral-800">
                <span>Total</span>
                <span>{formatCurrency(selected.total)}</span>
              </div>
            </div>

            {selected.notes && (
              <p className="text-sm text-neutral-600 bg-neutral-50 rounded-xl px-4 py-3">{selected.notes}</p>
            )}

            {selected.status !== "entregue" && selected.status !== "cancelado" && (
              <div className="flex gap-2 pt-1">
                {selected.status === "pendente" && (
                  <Button variant="secondary" className="flex-1" onClick={() => updateStatus(selected.id, "cancelado")}>
                    Cancelar
                  </Button>
                )}
                <Button
                  className="flex-1"
                  onClick={() =>
                    updateStatus(selected.id, selected.status === "pendente" ? "confirmado" : "entregue")
                  }
                >
                  {selected.status === "pendente" ? "Confirmar Pedido" : "Marcar como Entregue"}
                </Button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
