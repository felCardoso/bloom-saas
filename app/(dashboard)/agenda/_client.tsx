"use client";

import { useState, useTransition, useMemo } from "react";
import {
  Plus,
  CheckCircle2,
  Circle,
  Calendar,
  Phone,
  Gift,
  Truck,
  Trash2,
  Pencil,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatDate } from "@/lib/utils";
import type { ScheduleEvent, Client } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import {
  addEvento,
  toggleEvento,
  deleteEvento,
  updateEvento,
} from "@/lib/actions/agenda";

const typeMap = {
  follow_up: { label: "Follow-up", variant: "rose" as const, icon: Phone },
  entrega: { label: "Entrega", variant: "blue" as const, icon: Truck },
  aniversario: { label: "Aniversário", variant: "yellow" as const, icon: Gift },
  outro: { label: "Outro", variant: "gray" as const, icon: Calendar },
};

const emptyForm = {
  client_name: "",
  type: "follow_up" as ScheduleEvent["type"],
  title: "",
  description: "",
  date: "",
};

interface Props {
  initialEvents: ScheduleEvent[];
  clients: Client[];
}

export default function AgendaClient({ initialEvents, clients }: Props) {
  const { canAdd, usage, setUsage } = usePlan();
  const [events, setEvents] = useState<ScheduleEvent[]>(initialEvents);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [dayDetailOpen, setDayDetailOpen] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (filter === "pending") return !e.completed;
        if (filter === "done") return e.completed;
        return true;
      }),
    [events, filter],
  );

  const grouped = filtered.reduce<Record<string, ScheduleEvent[]>>(
    (acc, ev) => {
      if (!acc[ev.date]) acc[ev.date] = [];
      acc[ev.date].push(ev);
      return acc;
    },
    {},
  );

  const sortedDates = Object.keys(grouped).sort();

  function handleToggle(id: string, current: boolean) {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, completed: !current } : e)),
    );
    startTransition(async () => {
      await toggleEvento(id, !current);
    });
  }

  function handleDelete(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    startTransition(async () => {
      await deleteEvento(id);
    });
  }

  function openEdit(event: ScheduleEvent) {
    setEditingEvent(event);
    setEditForm({
      client_name: event.client_name ?? "",
      type: event.type,
      title: event.title,
      description: event.description ?? "",
      date: event.date,
    });
    setEditOpen(true);
  }

  function handleEdit() {
    if (!editingEvent || !editForm.title || !editForm.date) return;
    const id = editingEvent.id;
    startTransition(async () => {
      const result = await updateEvento(id, editForm);
      if (result.error) return;
      setEvents((prev) =>
        prev
          .map((e) => (e.id === id ? { ...e, ...editForm } : e))
          .sort((a, b) => a.date.localeCompare(b.date)),
      );
      setEditOpen(false);
      setEditingEvent(null);
    });
  }

  function handleAddClick() {
    if (!canAdd("events")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleAdd() {
    if (!form.title || !form.date) return;
    startTransition(async () => {
      const result = await addEvento(form);
      if (result.error) return;
      const newEvent: ScheduleEvent = {
        id: String(Date.now()),
        client_name: form.client_name,
        type: form.type,
        title: form.title,
        description: form.description,
        date: form.date,
        completed: false,
      };
      setEvents((prev) =>
        [...prev, newEvent].sort((a, b) => a.date.localeCompare(b.date)),
      );
      setUsage({ events: usage.events + 1 });
      setForm(emptyForm);
      setAddOpen(false);
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const pending = events.filter((e) => !e.completed).length;
  const overdue = events.filter((e) => !e.completed && e.date < today).length;

  // Map date → events for the calendar grid
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    for (const ev of filtered) {
      const list = map.get(ev.date) ?? [];
      list.push(ev);
      map.set(ev.date, list);
    }
    return map;
  }, [filtered]);

  // Build calendar grid cells for the current visible month
  const calendarCells = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay(); // 0 = Sunday
    const gridStart = new Date(year, month, 1 - startWeekday);
    const cells: { date: string; day: number; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      cells.push({
        date: iso,
        day: d.getDate(),
        inMonth: d.getMonth() === month,
      });
    }
    return cells;
  }, [calendarMonth]);

  const monthLabel = calendarMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  const dayDetailEvents = dayDetailOpen
    ? (eventsByDate.get(dayDetailOpen) ?? [])
    : [];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 shadow-card">
          {[
            { value: "pending", label: `Pendentes (${pending})` },
            { value: "done", label: "Concluídos" },
            { value: "all", label: "Todos" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                filter === tab.value
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        {overdue > 0 && (
          <Badge variant="red">
            {overdue} atrasado{overdue > 1 ? "s" : ""}
          </Badge>
        )}
        <div className="flex bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1 shadow-card">
          {[
            { value: "list", icon: List, label: "Lista" },
            { value: "calendar", icon: LayoutGrid, label: "Calendário" },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setViewMode(opt.value as typeof viewMode)}
                aria-label={opt.label}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg transition-all",
                  viewMode === opt.value
                    ? "bg-rose-500 text-white shadow-sm"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200",
                )}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
        <Button onClick={handleAddClick} size="sm" disabled={isPending}>
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Evento</span>
        </Button>
      </div>

      {/* Calendar view */}
      {viewMode === "calendar" && (
        <Card padding="none">
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <button
              onClick={() =>
                setCalendarMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() - 1, 1),
                )
              }
              aria-label="Mês anterior"
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 capitalize">
              {monthLabel}
            </p>
            <button
              onClick={() =>
                setCalendarMonth(
                  (d) => new Date(d.getFullYear(), d.getMonth() + 1, 1),
                )
              }
              aria-label="Próximo mês"
              className="p-1.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-800">
            {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((cell, i) => {
              const cellEvents = eventsByDate.get(cell.date) ?? [];
              const isToday = cell.date === today;
              const hasEvents = cellEvents.length > 0;
              return (
                <button
                  key={i}
                  onClick={() => setDayDetailOpen(cell.date)}
                  className={cn(
                    "min-h-16 sm:min-h-22 p-1.5 sm:p-2 border-r border-b border-neutral-50 dark:border-neutral-800/60 text-left transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 last:border-r-0 nth-[7n]:border-r-0",
                    !cell.inMonth && "bg-neutral-50/40 dark:bg-neutral-900/40",
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-xs font-semibold inline-flex items-center justify-center w-5 h-5 rounded-full",
                        isToday && "bg-rose-500 text-white",
                        !isToday &&
                          cell.inMonth &&
                          "text-neutral-700 dark:text-neutral-300",
                        !cell.inMonth &&
                          "text-neutral-300 dark:text-neutral-600",
                      )}
                    >
                      {cell.day}
                    </span>
                    {hasEvents && !isToday && (
                      <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">
                        {cellEvents.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {cellEvents.slice(0, 2).map((ev) => {
                      const type = typeMap[ev.type];
                      return (
                        <div
                          key={ev.id}
                          className={cn(
                            "text-[10px] sm:text-xs px-1.5 py-0.5 rounded truncate",
                            ev.completed
                              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 line-through"
                              : type.variant === "rose"
                                ? "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300"
                                : type.variant === "blue"
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                  : type.variant === "yellow"
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300"
                                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                          )}
                        >
                          {ev.title}
                        </div>
                      );
                    })}
                    {cellEvents.length > 2 && (
                      <p className="text-[10px] text-neutral-400 px-1.5">
                        + {cellEvents.length - 2}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Events list view */}
      {viewMode === "list" &&
        (sortedDates.length === 0 ? (
          <Card>
            <div className="py-12 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
              <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-1">
                {filter === "pending"
                  ? "Nenhum evento pendente"
                  : "Nenhum evento encontrado"}
              </p>
              <p className="text-neutral-400 dark:text-neutral-500 text-xs">
                Clique em &ldquo;Novo Evento&rdquo; para criar o primeiro.
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {sortedDates.map((date) => {
              const isToday = date === today;
              const isPast = date < today;
              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold",
                        isToday
                          ? "bg-rose-500 text-white"
                          : isPast
                            ? "bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400",
                      )}
                    >
                      {isToday ? "Hoje" : formatDate(date)}
                    </div>
                    <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
                  </div>

                  <div className="space-y-2.5">
                    {grouped[date].map((event) => {
                      const type = typeMap[event.type];
                      const Icon = type.icon;
                      return (
                        <Card key={event.id} padding="none">
                          <div className="flex items-start gap-3 px-4 py-3.5">
                            <button
                              onClick={() =>
                                handleToggle(event.id, event.completed)
                              }
                              className="shrink-0 text-neutral-300 hover:text-rose-400 transition-colors mt-0.5"
                            >
                              {event.completed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                              <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={cn(
                                  "text-sm font-medium",
                                  event.completed
                                    ? "text-neutral-400 dark:text-neutral-500 line-through"
                                    : "text-neutral-800 dark:text-neutral-100",
                                )}
                              >
                                {event.title}
                              </p>
                              {event.description && (
                                <p className="text-xs text-neutral-400 mt-0.5 truncate">
                                  {event.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 flex-wrap">
                                {event.client_name && (
                                  <div className="flex items-center gap-1.5">
                                    <Avatar
                                      name={event.client_name}
                                      size="sm"
                                    />
                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                      {event.client_name}
                                    </span>
                                  </div>
                                )}
                                <Badge variant={type.variant}>
                                  {type.label}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              <button
                                onClick={() => openEdit(event)}
                                className="p-1.5 rounded-lg text-neutral-300 hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="p-1.5 rounded-lg text-neutral-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        resource="events"
      />

      {/* Day detail modal — calendar click */}
      {dayDetailOpen && (
        <Modal
          open={!!dayDetailOpen}
          onClose={() => setDayDetailOpen(null)}
          title={new Date(dayDetailOpen + "T12:00:00").toLocaleDateString(
            "pt-BR",
            {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            },
          )}
        >
          <div className="space-y-3">
            {dayDetailEvents.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar className="w-7 h-7 mx-auto mb-2 text-neutral-300" />
                <p className="text-sm text-neutral-400">
                  Nenhum evento neste dia
                </p>
              </div>
            ) : (
              dayDetailEvents.map((event) => {
                const type = typeMap[event.type];
                const Icon = type.icon;
                return (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 px-3 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60"
                  >
                    <button
                      onClick={() => handleToggle(event.id, event.completed)}
                      className="shrink-0 text-neutral-300 hover:text-rose-400 transition-colors mt-0.5"
                    >
                      {event.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="w-8 h-8 bg-white dark:bg-neutral-900 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-card">
                      <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium",
                          event.completed
                            ? "text-neutral-400 line-through"
                            : "text-neutral-800 dark:text-neutral-100",
                        )}
                      >
                        {event.title}
                      </p>
                      {event.client_name && (
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                          {event.client_name}
                        </p>
                      )}
                      <Badge variant={type.variant} className="mt-2">
                        {type.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setDayDetailOpen(null);
                          openEdit(event);
                        }}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
            <Button
              className="w-full"
              onClick={() => {
                setForm({ ...emptyForm, date: dayDetailOpen });
                setDayDetailOpen(null);
                handleAddClick();
              }}
            >
              <Plus className="w-4 h-4" />
              Adicionar evento neste dia
            </Button>
          </div>
        </Modal>
      )}

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Novo Evento"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  type: e.target.value as ScheduleEvent["type"],
                }))
              }
              options={[
                { value: "follow_up", label: "Follow-up" },
                { value: "entrega", label: "Entrega" },
                { value: "aniversario", label: "Aniversário" },
                { value: "outro", label: "Outro" },
              ]}
            />
            <Input
              label="Data *"
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <Input
            label="Título *"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Ex: Ligar para apresentar catálogo"
          />
          <Select
            label="Cliente"
            value={clients.find((c) => c.name === form.client_name)?.id ?? ""}
            onChange={(e) => {
              const client = clients.find((c) => c.id === e.target.value);
              setForm((f) => ({ ...f, client_name: client?.name ?? "" }));
            }}
            options={[
              { value: "", label: "Nenhuma cliente" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Descrição
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Detalhes do evento..."
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
            <Button
              className="flex-1"
              onClick={handleAdd}
              disabled={isPending || !form.title || !form.date}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditingEvent(null);
        }}
        title="Editar Evento"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={editForm.type}
              onChange={(e) =>
                setEditForm((f) => ({
                  ...f,
                  type: e.target.value as ScheduleEvent["type"],
                }))
              }
              options={[
                { value: "follow_up", label: "Follow-up" },
                { value: "entrega", label: "Entrega" },
                { value: "aniversario", label: "Aniversário" },
                { value: "outro", label: "Outro" },
              ]}
            />
            <Input
              label="Data *"
              type="date"
              value={editForm.date}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, date: e.target.value }))
              }
            />
          </div>
          <Input
            label="Título *"
            value={editForm.title}
            onChange={(e) =>
              setEditForm((f) => ({ ...f, title: e.target.value }))
            }
            placeholder="Ex: Ligar para apresentar catálogo"
          />
          <Select
            label="Cliente"
            value={
              clients.find((c) => c.name === editForm.client_name)?.id ?? ""
            }
            onChange={(e) => {
              const client = clients.find((c) => c.id === e.target.value);
              setEditForm((f) => ({ ...f, client_name: client?.name ?? "" }));
            }}
            options={[
              { value: "", label: "Nenhuma cliente" },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Descrição
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={2}
              placeholder="Detalhes do evento..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setEditOpen(false);
                setEditingEvent(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleEdit}
              disabled={isPending || !editForm.title || !editForm.date}
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Salvar"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
