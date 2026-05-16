"use client";

import { useState } from "react";
import { Plus, CheckCircle2, Circle, Calendar, Phone, Gift, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { mockSchedule, mockClients } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { ScheduleEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";
import { UpgradeModal } from "@/components/ui/UpgradeModal";

const typeMap = {
  follow_up: { label: "Follow-up", variant: "rose" as const, icon: Phone },
  entrega: { label: "Entrega", variant: "blue" as const, icon: Truck },
  aniversario: { label: "Aniversário", variant: "yellow" as const, icon: Gift },
  outro: { label: "Outro", variant: "gray" as const, icon: Calendar },
};

export default function AgendaPage() {
  const { canAdd, usage, setUsage } = usePlan();
  const [events, setEvents] = useState<ScheduleEvent[]>(mockSchedule);
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("pending");
  const [form, setForm] = useState({
    client_id: "",
    type: "follow_up" as ScheduleEvent["type"],
    title: "",
    description: "",
    date: "",
  });

  const filtered = events.filter((e) => {
    if (filter === "pending") return !e.completed;
    if (filter === "done") return e.completed;
    return true;
  });

  const grouped = filtered.reduce<Record<string, ScheduleEvent[]>>((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort();

  function toggle(id: string) {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, completed: !e.completed } : e)));
  }

  function handleAddClick() {
    if (!canAdd("events")) {
      setUpgradeOpen(true);
    } else {
      setAddOpen(true);
    }
  }

  function handleAdd() {
    if (!form.client_id || !form.title || !form.date) return;
    const client = mockClients.find((c) => c.id === form.client_id);
    if (!client) return;
    const event: ScheduleEvent = {
      id: String(Date.now()),
      client_id: client.id,
      client_name: client.name,
      type: form.type,
      title: form.title,
      description: form.description,
      date: form.date,
      completed: false,
    };
    setEvents((prev) => [...prev, event].sort((a, b) => a.date.localeCompare(b.date)));
    setUsage({ events: usage.events + 1 });
    setForm({ client_id: "", type: "follow_up", title: "", description: "", date: "" });
    setAddOpen(false);
  }

  const today = new Date().toISOString().split("T")[0];
  const pending = events.filter((e) => !e.completed).length;
  const overdue = events.filter((e) => !e.completed && e.date < today).length;

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
                "px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all",
                filter === tab.value
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
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
        <Button onClick={handleAddClick} size="sm">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Evento</span>
        </Button>
      </div>

      {/* Events */}
      {sortedDates.length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-neutral-300" />
            <p className="text-neutral-400 text-sm">Nenhum evento encontrado</p>
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
                        : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
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
                          {/* Checkbox */}
                          <button
                            onClick={() => toggle(event.id)}
                            className="shrink-0 text-neutral-300 hover:text-rose-400 transition-colors mt-0.5"
                          >
                            {event.completed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5" />
                            )}
                          </button>

                          {/* Type icon */}
                          <div className="w-8 h-8 bg-neutral-50 dark:bg-neutral-800 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                            <Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" size={16} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                event.completed
                                  ? "text-neutral-400 dark:text-neutral-500 line-through"
                                  : "text-neutral-800 dark:text-neutral-100"
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
                              <div className="flex items-center gap-1.5">
                                <Avatar name={event.client_name} size="sm" />
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {event.client_name}
                                </span>
                              </div>
                              <Badge variant={type.variant}>{type.label}</Badge>
                            </div>
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
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} resource="events" />

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Novo Evento">
        <div className="space-y-4">
          <Select
            label="Cliente *"
            value={form.client_id}
            onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))}
            options={mockClients.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecione a cliente"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Tipo"
              value={form.type}
              onChange={(e) =>
                setForm((f) => ({ ...f, type: e.target.value as ScheduleEvent["type"] }))
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Descrição</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Detalhes do evento..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>
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
