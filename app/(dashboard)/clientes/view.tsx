"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCliente, updateCliente, deleteCliente } from "@/lib/actions/clientes";
import { importClientesCSV } from "@/lib/actions/csv";
import { parseCsv, normalizeHeaders } from "@/lib/csv-parse";
import type { ImportClienteRow } from "@/lib/actions/csv";
import {
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  MoreHorizontal,
  Users,
  ChevronRight,
  MessageCircle,
  Pencil,
  Trash2,
  Upload,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { LockedFeature } from "@/components/ui/LockedFeature";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils";
import type { Client, ClientStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";

const statusMap: Record<
  ClientStatus,
  { label: string; variant: "green" | "gray" | "rose" }
> = {
  ativa: { label: "Ativa", variant: "green" },
  inativa: { label: "Inativa", variant: "gray" },
  prospect: { label: "Prospect", variant: "rose" },
};

const emptyForm = {
  name: "",
  phone: "",
  email: "",
  city: "",
  status: "ativa" as ClientStatus,
  notes: "",
  birthday: "",
};

export function ClientesView({ initialClients }: { initialClients: Client[] }) {
  const router = useRouter();
  const { canAdd, hasFeature } = usePlan();
  const [isPending, startTransition] = useTransition();
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selected, setSelected] = useState<Client | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportClienteRow[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  useEffect(() => {
    setClients(initialClients);
  }, [initialClients]);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleAddClick() {
    if (!canAdd("clients")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleAdd() {
    if (!form.name || !form.phone) return;
    startTransition(async () => {
      await addCliente(form);
      setForm(emptyForm);
      setAddOpen(false);
      router.refresh();
    });
  }

  function openEdit(client: Client) {
    setEditingId(client.id);
    setEditForm({
      name: client.name,
      phone: client.phone,
      email: client.email ?? "",
      city: client.city ?? "",
      status: client.status,
      notes: client.notes ?? "",
      birthday: client.birthday ?? "",
    });
    setSelected(null);
    setEditOpen(true);
  }

  function handleEdit() {
    if (!editingId || !editForm.name || !editForm.phone) return;
    const id = editingId;
    startTransition(async () => {
      await updateCliente(id, editForm);
      setClients((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...editForm } : c))
      );
      setEditOpen(false);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!selected) return;
    const id = selected.id;
    startTransition(async () => {
      await deleteCliente(id);
      setClients((prev) => prev.filter((c) => c.id !== id));
      setSelected(null);
      setConfirmDelete(false);
    });
  }

  function handleCloseDetail() {
    setSelected(null);
    setConfirmDelete(false);
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCsv(text);
      const aliases = {
        name: ["nome", "name", "cliente"],
        phone: ["telefone", "phone", "tel", "celular"],
        email: ["email", "e-mail"],
        city: ["cidade", "city", "bairro", "bairro_cidade", "bairro/cidade"],
        status: ["status", "situacao", "situação"],
        notes: ["observacoes", "observações", "notes", "obs"],
        birthday: ["data de nascimento", "aniversario", "aniversário", "birthday", "data_nascimento"],
      };
      const rows: ImportClienteRow[] = parsed
        .map((r) => normalizeHeaders(r, aliases))
        .filter((r) => r.name.trim() !== "") as ImportClienteRow[];
      setImportRows(rows);
      setImportResult(null);
      setImportError(null);
    };
    reader.readAsText(file, "UTF-8");
    e.target.value = "";
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
    const result = await importClientesCSV(importRows);
    setImportLoading(false);
    if (result.error) {
      setImportError(result.error);
    } else {
      setImportResult({ imported: result.imported, skipped: result.skipped });
      setImportRows([]);
      router.refresh();
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, telefone..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent shadow-card"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-600 dark:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 shadow-card"
          >
            <option value="all">Todos</option>
            <option value="ativa">Ativa</option>
            <option value="inativa">Inativa</option>
            <option value="prospect">Prospect</option>
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
            <span className="hidden sm:inline">Nova Cliente</span>
          </Button>
        </div>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Total", value: clients.length, color: "text-neutral-800 dark:text-neutral-100" },
          {
            label: "Ativas",
            value: clients.filter((c) => c.status === "ativa").length,
            color: "text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Prospects",
            value: clients.filter((c) => c.status === "prospect").length,
            color: "text-rose-500 dark:text-rose-400",
          },
        ].map((s) => (
          <Card key={s.label} padding="sm">
            <p className={cn("text-xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-neutral-400 text-sm">
                Nenhuma cliente encontrada
              </p>
            </div>
          </Card>
        ) : (
          filtered.map((client) => {
            const status = statusMap[client.status];
            return (
              <button
                key={client.id}
                onClick={() => setSelected(client)}
                className="w-full text-left bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card p-4 flex items-center gap-3 hover:shadow-elevated transition-shadow active:scale-[0.99]"
              >
                <Avatar name={client.name} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                      {client.name}
                    </p>
                    <Badge variant={status.variant} className="shrink-0">
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatPhone(client.phone)}
                  </p>
                  {client.city && (
                    <p className="text-xs text-neutral-400">{client.city}</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-neutral-500">
                      {client.total_orders} pedidos
                    </span>
                    <span className="text-xs font-semibold text-rose-500">
                      {formatCurrency(client.total_spent)}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 shrink-0" />
              </button>
            );
          })
        )}
      </div>

      {/* Desktop table */}
      <Card padding="none" className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 dark:border-neutral-800">
                {[
                  "Cliente",
                  "Contato",
                  "Cidade",
                  "Status",
                  "Pedidos",
                  "Total Gasto",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
                    <p className="text-neutral-400 text-sm">
                      Nenhuma cliente encontrada
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((client) => {
                  const status = statusMap[client.status];
                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors cursor-pointer"
                      onClick={() => setSelected(client)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={client.name} size="sm" />
                          <div>
                            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100">
                              {client.name}
                            </p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500">
                              Desde {formatDate(client.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <Phone className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                            {formatPhone(client.phone)}
                          </div>
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                              <Mail className="w-3 h-3" />
                              {client.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {client.city ? (
                          <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                            <MapPin className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                            {client.city}
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-300 dark:text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {client.total_orders}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                          {formatCurrency(client.total_spent)}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Upgrade modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        resource="clients"
      />

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Nova Cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nome completo *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Ana Paula Ferreira"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone *"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="(11) 99999-9999"
              type="tel"
            />
            <Input
              label="Aniversário"
              value={form.birthday}
              onChange={(e) =>
                setForm((f) => ({ ...f, birthday: e.target.value }))
              }
              type="date"
            />
          </div>
          <Input
            label="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@exemplo.com"
            type="email"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cidade"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Ex: São Paulo"
            />
            <Select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  status: e.target.value as ClientStatus,
                }))
              }
              options={[
                { value: "ativa", label: "Ativa" },
                { value: "inativa", label: "Inativa" },
                { value: "prospect", label: "Prospect" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Observações
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Preferências, histórico, observações..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
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
            <Button className="flex-1" onClick={handleAdd} disabled={isPending}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Editar Cliente"
      >
        <div className="space-y-4">
          <Input
            label="Nome completo *"
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ex: Ana Paula Ferreira"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Telefone *"
              value={editForm.phone}
              onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="(11) 99999-9999"
              type="tel"
            />
            <Input
              label="Aniversário"
              value={editForm.birthday}
              onChange={(e) => setEditForm((f) => ({ ...f, birthday: e.target.value }))}
              type="date"
            />
          </div>
          <Input
            label="Email"
            value={editForm.email}
            onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="email@exemplo.com"
            type="email"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Cidade"
              value={editForm.city}
              onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="Ex: São Paulo"
            />
            <Select
              label="Status"
              value={editForm.status}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  status: e.target.value as ClientStatus,
                }))
              }
              options={[
                { value: "ativa", label: "Ativa" },
                { value: "inativa", label: "Inativa" },
                { value: "prospect", label: "Prospect" },
              ]}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Observações
            </label>
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Preferências, histórico, observações..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="flex-1" onClick={handleEdit} disabled={isPending}>
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Import modal */}
      <Modal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        title="Importar clientes (CSV)"
        size="lg"
      >
        <div className="space-y-5">
          {importResult ? (
            <div className="py-6 text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-emerald-500" />
              </div>
              <p className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
                {importResult.imported} cliente{importResult.imported !== 1 ? "s" : ""} importada{importResult.imported !== 1 ? "s" : ""}
              </p>
              {importResult.skipped > 0 && (
                <p className="text-sm text-neutral-400">{importResult.skipped} linha{importResult.skipped !== 1 ? "s" : ""} ignorada{importResult.skipped !== 1 ? "s" : ""} (sem nome ou limite do plano)</p>
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
                  <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">Formato esperado (cabeçalho na 1ª linha)</p>
                </div>
                <code className="text-xs text-neutral-500 dark:text-neutral-400 block leading-relaxed">
                  Nome, Telefone, Email, Cidade, Status, Observacoes, Data de Nascimento
                </code>
                <p className="text-xs text-neutral-400 dark:text-neutral-500">Status aceitos: <span className="font-medium">ativa</span>, <span className="font-medium">inativa</span>, <span className="font-medium">prospect</span></p>
              </div>

              <label className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-2xl cursor-pointer hover:border-rose-300 dark:hover:border-rose-700 transition-colors group">
                <Upload className="w-8 h-8 text-neutral-300 dark:text-neutral-600 group-hover:text-rose-400 transition-colors" />
                <div className="text-center">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Clique para selecionar o arquivo</p>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">Arquivo .csv, codificação UTF-8</p>
                </div>
                <input type="file" accept=".csv,text/csv" onChange={handleImportFile} className="hidden" />
              </label>

              {importError && (
                <p className="text-sm text-red-500 text-center">{importError}</p>
              )}

              {importRows.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {importRows.length} registro{importRows.length !== 1 ? "s" : ""} encontrado{importRows.length !== 1 ? "s" : ""} — prévia das primeiras 5 linhas:
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700">
                    <table className="min-w-full text-xs">
                      <thead className="bg-neutral-50 dark:bg-neutral-800">
                        <tr>
                          {["Nome", "Telefone", "Email", "Cidade", "Status"].map((h) => (
                            <th key={h} className="px-3 py-2 text-left font-semibold text-neutral-500 dark:text-neutral-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {importRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="bg-white dark:bg-neutral-900">
                            <td className="px-3 py-2 text-neutral-700 dark:text-neutral-300 font-medium truncate max-w-[120px]">{r.name || "—"}</td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{r.phone || "—"}</td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400 truncate max-w-[120px]">{r.email || "—"}</td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{r.city || "—"}</td>
                            <td className="px-3 py-2 text-neutral-500 dark:text-neutral-400">{r.status || "ativa"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => { setImportRows([]); setImportError(null); }}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleImportConfirm}
                      disabled={importLoading}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition-colors disabled:opacity-60"
                    >
                      {importLoading ? "Importando..." : `Importar ${importRows.length} cliente${importRows.length !== 1 ? "s" : ""}`}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Detail modal */}
      {selected && (
        <Modal
          open={!!selected}
          onClose={handleCloseDetail}
          title={selected.name}
          size="lg"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar name={selected.name} size="lg" />
              <div>
                <Badge variant={statusMap[selected.status].variant}>
                  {statusMap[selected.status].label}
                </Badge>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">
                  Cliente desde {formatDate(selected.created_at)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Pedidos", value: String(selected.total_orders) },
                {
                  label: "Total gasto",
                  value: formatCurrency(selected.total_spent),
                  highlight: true,
                },
                {
                  label: "Ticket médio",
                  value:
                    selected.total_orders > 0
                      ? formatCurrency(
                          selected.total_spent / selected.total_orders,
                        )
                      : "—",
                },
                {
                  label: "Último pedido",
                  value: selected.last_order_date
                    ? formatDate(selected.last_order_date)
                    : "—",
                },
              ].map((s) => (
                <div key={s.label} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                  <p
                    className={cn(
                      "text-base font-bold",
                      s.highlight ? "text-rose-600" : "text-neutral-800 dark:text-neutral-100",
                    )}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {selected.phone && (
                <div className="flex gap-2">
                  <a
                    href={`tel:${selected.phone}`}
                    className="flex-1 flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center shadow-card">
                      <Phone className="w-4 h-4 text-rose-500" />
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">Telefone</p>
                      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {formatPhone(selected.phone)}
                      </p>
                    </div>
                  </a>
                  {hasFeature("whatsappLink") ? (
                    <a
                      href={`https://wa.me/55${selected.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-3 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600 hidden sm:block">
                        WhatsApp
                      </span>
                    </a>
                  ) : (
                    <LockedFeature
                      feature="whatsappLink"
                      className="px-3 py-3 bg-neutral-50 rounded-xl"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </LockedFeature>
                  )}
                </div>
              )}
              {selected.email && (
                <a
                  href={`mailto:${selected.email}`}
                  className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                >
                  <div className="w-8 h-8 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center shadow-card">
                    <Mail className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Email</p>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {selected.email}
                    </p>
                  </div>
                </a>
              )}
              {selected.city && (
                <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
                  <div className="w-8 h-8 bg-white dark:bg-neutral-900 rounded-lg flex items-center justify-center shadow-card">
                    <MapPin className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Cidade</p>
                    <p className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                      {selected.city}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {selected.notes && (
              <div>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-wide mb-2">
                  Observações
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-3">
                  {selected.notes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
              {confirmDelete ? (
                <div className="space-y-3">
                  <p className="text-sm text-center text-neutral-600 dark:text-neutral-300">
                    Excluir <strong>{selected.name}</strong>? Esta ação não pode ser desfeita.
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
                    onClick={() => openEdit(selected)}
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
    </div>
  );
}
