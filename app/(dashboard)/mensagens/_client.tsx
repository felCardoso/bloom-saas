"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MessageCircle,
  Plus,
  Pencil,
  Trash2,
  Clock,
  Lock,
  Phone,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlan } from "@/lib/plan-context";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { WhatsAppTemplate, WaTemplateType, Client, Order } from "@/lib/types";
import { addTemplate, updateTemplate, deleteTemplate } from "@/lib/actions/mensagens";

type Tab = "templates" | "enviar";

const TYPE_LABELS: Record<WaTemplateType, string> = {
  aniversario: "Aniversário",
  pedido_pendente: "Pedido pendente",
  promocao: "Promoção",
  pos_venda: "Pós-venda",
  personalizado: "Personalizado",
};

const TYPE_COLORS: Record<WaTemplateType, string> = {
  aniversario: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  pedido_pendente: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  promocao: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  pos_venda: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  personalizado: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
};

const DEFAULT_MESSAGES: Record<WaTemplateType, string> = {
  aniversario:
    "Oi {nome}! 🎂 Feliz aniversário! Espero que seu dia seja muito especial. Tenho novidades incríveis esperando por você! 💕",
  pedido_pendente:
    "Oi {nome}! Como vai? Vi que seu pedido ainda está pendente. Posso ajudar com alguma coisa? 😊",
  promocao:
    "Oi {nome}! 🌸 Temos promoções incríveis essa semana. Me chame para saber mais!",
  pos_venda:
    "Oi {nome}! Espero que esteja amando {produto}! Qualquer dúvida, pode me chamar. 😊",
  personalizado: "",
};

interface FormState {
  nome: string;
  tipo: WaTemplateType;
  mensagem: string;
}

interface Suggestion {
  client: Client;
  tipo: WaTemplateType;
  label: string;
  sublabel?: string;
}

export default function MensagensClient({
  initialTemplates,
  initialClients,
  initialOrders,
}: {
  initialTemplates: WhatsAppTemplate[];
  initialClients: Client[];
  initialOrders: Order[];
}) {
  const router = useRouter();
  const { plan, hasFeature } = usePlan();
  const [, startTransition] = useTransition();

  const [tab, setTab] = useState<Tab>("templates");

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WhatsAppTemplate | null>(null);
  const [form, setForm] = useState<FormState>({ nome: "", tipo: "personalizado", mensagem: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  const canUseWa = hasFeature("whatsappLink");
  const templateLimit = plan.limits.messageTemplates;
  const atTemplateLimit = templateLimit !== -1 && initialTemplates.length >= templateLimit;

  const suggestions = useMemo<Suggestion[]>(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, "0");
    const todayMD = `${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const tomorrowMD = `${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}`;

    const result: Suggestion[] = [];

    for (const client of initialClients) {
      if (!client.birthday || !client.phone) continue;
      const md = client.birthday.slice(5); // "YYYY-MM-DD" → "MM-DD"
      if (md === todayMD) {
        result.push({ client, tipo: "aniversario", label: "Aniversário hoje 🎂" });
      } else if (md === tomorrowMD) {
        result.push({ client, tipo: "aniversario", label: "Aniversário amanhã 🎂" });
      }
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const pendingIds = new Set(
      initialOrders
        .filter((o) => o.status === "pendente" && new Date(o.created_at) < cutoff)
        .map((o) => o.client_id),
    );
    for (const client of initialClients) {
      if (!pendingIds.has(client.id) || !client.phone) continue;
      result.push({
        client,
        tipo: "pedido_pendente",
        label: "Pedido pendente",
        sublabel: "há mais de 7 dias",
      });
    }

    return result;
  }, [initialClients, initialOrders]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.toLowerCase().trim();
    return initialClients
      .filter((c) => c.phone)
      .filter(
        (c) => !q || c.name.toLowerCase().includes(q) || c.phone.includes(q),
      );
  }, [initialClients, clientSearch]);

  function openAdd() {
    setEditing(null);
    setForm({ nome: "", tipo: "personalizado", mensagem: "" });
    setFormError(null);
    setShowForm(true);
  }

  function openEdit(t: WhatsAppTemplate) {
    setEditing(t);
    setForm({ nome: t.nome, tipo: t.tipo, mensagem: t.mensagem });
    setFormError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setFormError(null);
  }

  function handleTipoChange(tipo: WaTemplateType) {
    setForm((prev) => ({
      ...prev,
      tipo,
      mensagem: prev.mensagem.trim() ? prev.mensagem : DEFAULT_MESSAGES[tipo],
    }));
  }

  async function handleSave() {
    if (!form.nome.trim()) {
      setFormError("Informe um nome para o template.");
      return;
    }
    if (!form.mensagem.trim()) {
      setFormError("Escreva a mensagem do template.");
      return;
    }
    setSaving(true);
    setFormError(null);
    const result = editing
      ? await updateTemplate(editing.id, form)
      : await addTemplate(form);
    setSaving(false);
    if (result.error) {
      setFormError(result.error);
      return;
    }
    closeForm();
    router.refresh();
  }

  function handleDelete() {
    if (!deleteId) return;
    startTransition(async () => {
      await deleteTemplate(deleteId);
      setDeleteId(null);
      router.refresh();
    });
  }

  function fillMessage(mensagem: string, client: Client): string {
    const firstName = client.name.split(" ")[0];
    return mensagem
      .replace(/\{nome\}/g, firstName)
      .replace(/\{produto\}/g, "seus produtos")
      .replace(/\{valor\}/g, "");
  }

  function openWa(client: Client, mensagem: string) {
    const num = client.phone.replace(/\D/g, "");
    const withDDI = num.startsWith("55") ? num : `55${num}`;
    window.open(
      `https://wa.me/${withDDI}?text=${encodeURIComponent(mensagem)}`,
      "_blank",
    );
  }

  function openWaSuggestion(s: Suggestion) {
    const template =
      initialTemplates.find((t) => t.tipo === s.tipo) ?? initialTemplates[0];
    if (!template) return;
    openWa(s.client, fillMessage(template.mensagem, s.client));
  }

  const preview =
    selectedClient && selectedTemplate
      ? fillMessage(selectedTemplate.mensagem, selectedClient)
      : "";

  if (!canUseWa) {
    return (
      <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 lg:pb-0">
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 lg:px-6">
          <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Mensagens</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Templates e envio rápido via WhatsApp</p>
        </div>
        <div className="flex flex-col items-center justify-center flex-1 py-20 px-6 text-center">
          <div className="w-14 h-14 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-neutral-400 dark:text-neutral-500" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
            Mensagens disponíveis no Plus
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm mb-6">
            Crie templates personalizados e envie mensagens rápidas via WhatsApp para seus clientes com um toque.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-rose-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-rose-600 transition-colors"
          >
            Ver planos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 dark:bg-neutral-950 pb-20 lg:pb-0">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-4 py-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Mensagens
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Templates e envio rápido via WhatsApp
            </p>
          </div>
          {tab === "templates" && (
            <Button
              onClick={openAdd}
              disabled={atTemplateLimit}
              size="sm"
              title={
                atTemplateLimit
                  ? `Limite de ${templateLimit} templates atingido`
                  : undefined
              }
            >
              <Plus size={16} />
              Novo template
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 w-fit">
          {(["templates", "enviar"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                tab === t
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300",
              )}
            >
              {t === "templates" ? "Templates" : "Enviar rápido"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 lg:p-6">
        {/* ── Templates tab ── */}
        {tab === "templates" && (
          <div className="max-w-2xl mx-auto space-y-3">
            {/* Limit bar (free plan) */}
            {templateLimit !== -1 && (
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-neutral-600 dark:text-neutral-400">
                    Templates usados
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      atTemplateLimit
                        ? "text-red-500"
                        : "text-neutral-700 dark:text-neutral-300",
                    )}
                  >
                    {initialTemplates.length} / {templateLimit}
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      atTemplateLimit ? "bg-red-400" : "bg-rose-400",
                    )}
                    style={{
                      width: `${Math.min((initialTemplates.length / templateLimit) * 100, 100)}%`,
                    }}
                  />
                </div>
                {atTemplateLimit && (
                  <p className="text-xs text-red-500 mt-1.5">
                    Limite atingido.{" "}
                    <Link href="/pricing" className="underline font-medium">
                      Faça upgrade
                    </Link>{" "}
                    para criar mais templates.
                  </p>
                )}
              </div>
            )}

            {/* Empty state */}
            {initialTemplates.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="text-rose-400" size={24} />
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium mb-1">
                  Nenhum template ainda
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                  Crie templates reutilizáveis para enviar mensagens rápidas no
                  WhatsApp
                </p>
                <Button onClick={openAdd} size="sm">
                  <Plus size={16} />
                  Criar primeiro template
                </Button>
              </div>
            ) : (
              <>
                {initialTemplates.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                            {t.nome}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0",
                              TYPE_COLORS[t.tipo],
                            )}
                          >
                            {TYPE_LABELS[t.tipo]}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 whitespace-pre-wrap">
                          {t.mensagem}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(t.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-800/30 rounded-xl px-4 py-3">
                  <p className="text-xs text-rose-700 dark:text-rose-400">
                    <span className="font-medium">Variáveis disponíveis:</span>{" "}
                    <code className="bg-rose-100 dark:bg-rose-900/30 px-1 rounded">
                      {"{nome}"}
                    </code>{" "}
                    nome do cliente,{" "}
                    <code className="bg-rose-100 dark:bg-rose-900/30 px-1 rounded">
                      {"{produto}"}
                    </code>{" "}
                    produto,{" "}
                    <code className="bg-rose-100 dark:bg-rose-900/30 px-1 rounded">
                      {"{valor}"}
                    </code>{" "}
                    valor
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Enviar tab – Free gate ── */}
        {tab === "enviar" && !canUseWa && (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto mb-4">
              <Lock className="text-neutral-400" size={24} />
            </div>
            <h3 className="text-base font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
              Disponível no Pro e Premium
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
              O envio rápido por WhatsApp está disponível nos planos pagos.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
            >
              Ver planos
            </Link>
          </div>
        )}

        {/* ── Enviar tab – Pro/Premium ── */}
        {tab === "enviar" && canUseWa && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Suggestions */}
            <div>
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Sugestões automáticas
              </h2>
              {suggestions.length === 0 ? (
                <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-6 text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    Nenhuma sugestão por hoje. 🎉
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((s, i) => {
                    const hasAnyTemplate = initialTemplates.length > 0;
                    return (
                      <div
                        key={i}
                        className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 px-4 py-3 flex items-center gap-3"
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0",
                            TYPE_COLORS[s.tipo],
                          )}
                        >
                          {s.tipo === "aniversario" ? (
                            "🎂"
                          ) : (
                            <Clock size={16} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                            {s.client.name}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                            {s.label}
                            {s.sublabel ? ` · ${s.sublabel}` : ""}
                            {" · "}
                            {s.client.phone}
                          </p>
                        </div>
                        <button
                          onClick={() =>
                            hasAnyTemplate ? openWaSuggestion(s) : undefined
                          }
                          disabled={!hasAnyTemplate}
                          title={
                            !hasAnyTemplate
                              ? "Crie um template primeiro"
                              : `Enviar para ${s.client.name}`
                          }
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                            hasAnyTemplate
                              ? "bg-[#25D366] text-white hover:bg-[#1ebe5d]"
                              : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 cursor-not-allowed",
                          )}
                        >
                          <MessageCircle size={14} />
                          WhatsApp
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Manual compose */}
            <div>
              <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                Envio manual
              </h2>
              <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 space-y-4">
                {/* Client search */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Cliente
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar por nome ou telefone..."
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setSelectedClient(null);
                      }}
                      className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
                    />
                    {selectedClient && (
                      <button
                        onClick={() => {
                          setSelectedClient(null);
                          setClientSearch("");
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {clientSearch && !selectedClient &&
                    filteredClients.length > 0 && (
                      <div className="mt-1 border border-neutral-200 dark:border-neutral-700 rounded-lg overflow-hidden bg-white dark:bg-neutral-900 shadow-sm max-h-44 overflow-y-auto">
                        {filteredClients.slice(0, 8).map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              setSelectedClient(c);
                              setClientSearch(c.name);
                            }}
                            className="w-full text-left px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 last:border-0"
                          >
                            <span className="font-medium">{c.name}</span>
                            <span className="text-xs text-neutral-400">
                              {c.phone}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  {clientSearch && !selectedClient &&
                    filteredClients.length === 0 && (
                      <p className="text-xs text-neutral-500 mt-1.5">
                        Nenhum cliente com telefone encontrado.
                      </p>
                    )}
                  {selectedClient && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                      <Phone size={11} />
                      {selectedClient.phone}
                    </div>
                  )}
                </div>

                {/* Template select */}
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                    Template
                  </label>
                  {initialTemplates.length === 0 ? (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Nenhum template ainda.{" "}
                      <button
                        onClick={() => setTab("templates")}
                        className="text-rose-500 hover:underline font-medium"
                      >
                        Criar agora
                      </button>
                    </p>
                  ) : (
                    <div className="grid gap-2">
                      {initialTemplates.map((t) => (
                        <button
                          key={t.id}
                          onClick={() =>
                            setSelectedTemplate(
                              selectedTemplate?.id === t.id ? null : t,
                            )
                          }
                          className={cn(
                            "w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
                            selectedTemplate?.id === t.id
                              ? "border-rose-400 bg-rose-50 dark:bg-rose-900/20 dark:border-rose-600"
                              : "border-neutral-200 dark:border-neutral-700 hover:border-rose-300 dark:hover:border-rose-700",
                          )}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-neutral-800 dark:text-neutral-100">
                              {t.nome}
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-medium px-1.5 py-0.5 rounded-full",
                                TYPE_COLORS[t.tipo],
                              )}
                            >
                              {TYPE_LABELS[t.tipo]}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Preview */}
                {preview && (
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                      Prévia
                    </label>
                    <div className="bg-[#e7fce8] dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl rounded-tl-sm p-3">
                      <p className="text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                        {preview}
                      </p>
                    </div>
                  </div>
                )}

                {/* Send button */}
                <button
                  onClick={() =>
                    selectedClient &&
                    selectedTemplate &&
                    openWa(selectedClient, preview)
                  }
                  disabled={!selectedClient || !selectedTemplate}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all",
                    selectedClient && selectedTemplate
                      ? "bg-[#25D366] text-white hover:bg-[#1ebe5d] shadow-sm"
                      : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 cursor-not-allowed",
                  )}
                >
                  <MessageCircle size={16} />
                  Abrir no WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        open={showForm}
        onClose={closeForm}
        title={editing ? "Editar template" : "Novo template"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Nome do template
            </label>
            <input
              type="text"
              placeholder="Ex: Feliz aniversário"
              value={form.nome}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, nome: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tipo
            </label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as WaTemplateType[]).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => handleTipoChange(tipo)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                    form.tipo === tipo
                      ? "border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-600"
                      : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300",
                  )}
                >
                  {TYPE_LABELS[tipo]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Mensagem
            </label>
            <textarea
              rows={5}
              placeholder="Oi {nome}! ..."
              value={form.mensagem}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, mensagem: e.target.value }))
              }
              className="w-full px-3 py-2 text-sm bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-800 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-400 resize-none"
            />
            <p className="text-[11px] text-neutral-400 mt-1">
              Variáveis:{" "}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                {"{nome}"}
              </code>{" "}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                {"{produto}"}
              </code>{" "}
              <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">
                {"{valor}"}
              </code>
            </p>
          </div>

          {formError && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {formError}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={closeForm}
              className="flex-1"
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              loading={saving}
            >
              {editing ? "Salvar" : "Criar template"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Excluir template"
      >
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-5">
          Tem certeza que deseja excluir este template? Essa ação não pode ser
          desfeita.
        </p>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={() => setDeleteId(null)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDelete} className="flex-1">
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  );
}
