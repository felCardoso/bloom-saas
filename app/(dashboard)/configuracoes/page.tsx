"use client";

import { useState } from "react";
import {
  User, CreditCard, Bell, Shield, Trash2, Eye, EyeOff,
  Check, Download, AlertTriangle, Monitor, Smartphone,
  LogOut, ChevronRight, Zap,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { usePlan } from "@/lib/plan-context";
import { getInitials } from "@/lib/utils";

type Tab = "perfil" | "assinatura" | "notificacoes" | "seguranca" | "conta";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "assinatura", label: "Assinatura", icon: CreditCard },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "conta", label: "Conta", icon: Trash2 },
];

const PLAN_BADGE: Record<string, string> = {
  free: "bg-neutral-100 text-neutral-600",
  pro: "bg-rose-100 text-rose-600",
  premium: "bg-violet-100 text-violet-600",
};
const PLAN_CARD: Record<string, string> = {
  free: "from-neutral-50 to-neutral-100 border-neutral-200",
  pro: "from-rose-50 to-rose-100 border-rose-200",
  premium: "from-violet-50 to-violet-100 border-violet-200",
};
const PLAN_ACCENT: Record<string, string> = {
  free: "text-neutral-600",
  pro: "text-rose-600",
  premium: "text-violet-600",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2",
        checked ? "bg-rose-500" : "bg-neutral-200"
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5",
          checked ? "translate-x-4" : "translate-x-0.5"
        )}
      />
    </button>
  );
}

function SaveButton({ saved, loading, onClick }: { saved: boolean; loading: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || saved}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm",
        saved
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60"
      )}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      ) : saved ? (
        <>
          <Check className="w-4 h-4" />
          Salvo
        </>
      ) : (
        "Salvar alterações"
      )}
    </button>
  );
}

/* ── Perfil ── */
function PerfilTab() {
  const [form, setForm] = useState({
    name: "Ana Consultora",
    email: "ana@exemplo.com",
    phone: "(11) 99999-0000",
    brand: "Ana Beauty",
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 900);
  };

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold text-rose-600">{getInitials(form.name || "AC")}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-800">{form.name}</p>
          <p className="text-xs text-neutral-500 mt-0.5">{form.email}</p>
          <button className="text-xs text-rose-500 hover:text-rose-600 font-medium mt-1.5 transition-colors">
            Alterar foto
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nome completo"
          value={form.name}
          onChange={(e) => { setForm({ ...form, name: e.target.value }); setSaved(false); }}
          placeholder="Seu nome"
        />
        <Input
          label="E-mail"
          type="email"
          value={form.email}
          onChange={(e) => { setForm({ ...form, email: e.target.value }); setSaved(false); }}
          placeholder="seuemail@exemplo.com"
        />
        <Input
          label="Telefone"
          type="tel"
          value={form.phone}
          onChange={(e) => { setForm({ ...form, phone: e.target.value }); setSaved(false); }}
          placeholder="(11) 99999-0000"
        />
        <Input
          label="Nome da loja / marca"
          value={form.brand}
          onChange={(e) => { setForm({ ...form, brand: e.target.value }); setSaved(false); }}
          placeholder="Ex: Ana Beauty"
          hint="Aparece nos seus documentos e relatórios."
        />
      </div>

      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <SaveButton saved={saved} loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Assinatura ── */
function AssinaturaTab() {
  const { planId, plan } = usePlan();

  const featureList: string[] = {
    free: ["Até 30 clientes", "Até 20 pedidos/mês", "Até 20 produtos", "Suporte por e-mail"],
    pro: ["Até 200 clientes", "Até 150 pedidos/mês", "Relatórios básicos", "WhatsApp rápido", "Alertas de estoque", "Lembretes de aniversário", "Suporte por e-mail (48h)"],
    premium: ["Clientes ilimitados", "Pedidos ilimitados", "Relatórios avançados", "Exportação CSV", "Até 3 usuários", "Suporte prioritário (24h)"],
  }[planId];

  return (
    <div className="space-y-6">
      {/* Plan card */}
      <div className={cn("rounded-2xl border bg-gradient-to-br p-5 sm:p-6", PLAN_CARD[planId])}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full", PLAN_BADGE[planId])}>
              Plano {plan.name}
            </span>
            <div className="flex items-baseline gap-1 mt-3">
              <span className={cn("text-3xl font-bold", PLAN_ACCENT[planId])}>
                {plan.price === 0 ? "Grátis" : `R$ ${plan.price}`}
              </span>
              {plan.price > 0 && (
                <span className="text-sm text-neutral-500">/mês</span>
              )}
            </div>
            {plan.price > 0 && (
              <p className="text-xs text-neutral-500 mt-1">
                Próxima cobrança: 15 de junho de 2026
              </p>
            )}
          </div>
          {planId !== "premium" && (
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors shadow-sm flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              Fazer upgrade
            </Link>
          )}
        </div>

        <div className="border-t border-black/5 pt-4">
          <p className="text-xs font-semibold text-neutral-600 mb-2.5">Incluído no seu plano</p>
          <ul className="space-y-1.5">
            {featureList.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-neutral-700">
                <Check className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Billing history (static) */}
      {plan.price > 0 && (
        <div className="bg-white rounded-2xl border border-neutral-200">
          <div className="px-5 py-3.5 border-b border-neutral-100">
            <p className="text-sm font-semibold text-neutral-800">Histórico de cobranças</p>
          </div>
          <div className="divide-y divide-neutral-50">
            {[
              { date: "15 mai 2026", desc: `Plano ${plan.name}`, value: `R$ ${plan.price},00`, status: "Pago" },
              { date: "15 abr 2026", desc: `Plano ${plan.name}`, value: `R$ ${plan.price},00`, status: "Pago" },
              { date: "15 mar 2026", desc: `Plano ${plan.name}`, value: `R$ ${plan.price},00`, status: "Pago" },
            ].map((row) => (
              <div key={row.date} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm text-neutral-800">{row.desc}</p>
                  <p className="text-xs text-neutral-400">{row.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-800">{row.value}</p>
                  <span className="text-[11px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-medium">{row.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Danger */}
      {plan.price > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 bg-neutral-50">
          <div>
            <p className="text-sm font-medium text-neutral-700">Cancelar assinatura</p>
            <p className="text-xs text-neutral-400 mt-0.5">Sua conta retorna ao plano Grátis ao fim do período.</p>
          </div>
          <button className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
            Cancelar
          </button>
        </div>
      )}

      {planId === "free" && (
        <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-800">Experimente o plano Pro grátis</p>
            <p className="text-xs text-neutral-500 mt-0.5">14 dias, sem cartão de crédito.</p>
          </div>
          <Link href="/pricing" className="flex-shrink-0 px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors">
            Testar Pro
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Notificações ── */
function NotificacoesTab() {
  const { hasFeature } = usePlan();
  const [notifs, setNotifs] = useState({
    birthdays: hasFeature("birthdayReminders"),
    pendingOrders: true,
    stockAlerts: hasFeature("stockAlerts"),
    newsletter: false,
    push: false,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (key: keyof typeof notifs) => {
    setNotifs((v) => ({ ...v, [key]: !v[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  const rows: { key: keyof typeof notifs; label: string; desc: string; locked?: boolean }[] = [
    { key: "birthdays", label: "Lembretes de aniversário", desc: "Aviso 1 dia antes do aniversário de clientes.", locked: !hasFeature("birthdayReminders") },
    { key: "pendingOrders", label: "Pedidos pendentes há 7+ dias", desc: "Alerta quando um pedido está sem atualização." },
    { key: "stockAlerts", label: "Estoque baixo (≤ 5 unidades)", desc: "Notificação quando produtos estão acabando.", locked: !hasFeature("stockAlerts") },
    { key: "newsletter", label: "Dicas e novidades por e-mail", desc: "Conteúdo sobre vendas, beleza e gestão." },
    { key: "push", label: "Notificações no navegador", desc: "Alertas em tempo real mesmo com o app fechado." },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-50">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-800">{row.label}</p>
                {row.locked && (
                  <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md font-semibold border border-amber-100">
                    Pro+
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{row.desc}</p>
            </div>
            <Toggle
              checked={notifs[row.key]}
              onChange={() => !row.locked && toggle(row.key)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-2 border-t border-neutral-100">
        <SaveButton saved={saved} loading={loading} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Segurança ── */
function SegurancaTab() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handleChangePw = () => {
    if (!pw.current) { setPwError("Informe a senha atual."); return; }
    if (pw.next.length < 8) { setPwError("Nova senha precisa ter ao menos 8 caracteres."); return; }
    if (pw.next !== pw.confirm) { setPwError("A confirmação não bate com a nova senha."); return; }
    setPwError("");
    setPwLoading(true);
    setTimeout(() => {
      setPwLoading(false);
      setPwSaved(true);
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    }, 900);
  };

  const sessions = [
    { device: "Chrome · MacBook Pro", location: "São Paulo, SP", lastSeen: "Agora", current: true, Icon: Monitor },
    { device: "Safari · iPhone 15", location: "São Paulo, SP", lastSeen: "Há 2 horas", current: false, Icon: Smartphone },
  ];

  return (
    <div className="space-y-8">
      {/* Change password */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-4">Alterar senha</h3>
        <div className="space-y-4 max-w-sm">
          {/* Current password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Senha atual</label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                placeholder="••••••••"
                value={pw.current}
                onChange={(e) => { setPw({ ...pw, current: e.target.value }); setPwError(""); }}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700">Nova senha</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={pw.next}
                onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwError(""); }}
                className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-neutral-200 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
              />
              <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a nova senha"
            value={pw.confirm}
            onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); setPwError(""); }}
          />

          {pwError && <p className="text-xs text-red-500">{pwError}</p>}

          <SaveButton saved={pwSaved} loading={pwLoading} onClick={handleChangePw} />
        </div>
      </div>

      {/* Sessions */}
      <div className="border-t border-neutral-100 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-neutral-800">Sessões ativas</h3>
          <button className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
            Encerrar outras sessões
          </button>
        </div>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div key={s.device} className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                <s.Icon className="w-4 h-4 text-neutral-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-800 truncate">{s.device}</p>
                  {s.current && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md font-semibold flex-shrink-0">
                      Este dispositivo
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{s.location} · {s.lastSeen}</p>
              </div>
              {!s.current && (
                <button className="text-xs text-neutral-400 hover:text-red-500 transition-colors flex-shrink-0">
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Conta ── */
function ContaTab() {
  const { planId, hasFeature } = usePlan();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const userEmail = "ana@exemplo.com";

  return (
    <div className="space-y-8">
      {/* Export */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 mb-1">Exportar meus dados</h3>
        <p className="text-sm text-neutral-500 mb-4">
          Baixe um arquivo CSV com todos os seus clientes, pedidos e produtos.
        </p>
        {hasFeature("csvExport") ? (
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors">
            <Download className="w-4 h-4" />
            Exportar dados (CSV)
          </button>
        ) : (
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-700">Disponível no plano Premium</p>
              <p className="text-xs text-neutral-400 mt-0.5">Ou solicite por e-mail em até 5 dias úteis.</p>
            </div>
            <Link href="/pricing" className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 text-white text-xs font-semibold rounded-xl hover:bg-rose-600 transition-colors">
              <Zap className="w-3.5 h-3.5" />
              Upgrade
            </Link>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="border-t border-neutral-100 pt-6">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Zona de perigo</h3>
        <p className="text-sm text-neutral-500 mb-5">
          Ações irreversíveis que afetam permanentemente sua conta.
        </p>

        {!deleteOpen ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
        ) : (
          <div className="p-5 bg-red-50 rounded-2xl border border-red-200 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Esta ação é permanente e irreversível</p>
                <p className="text-xs text-red-600 mt-1 leading-relaxed">
                  Todos os seus dados — clientes, pedidos, produtos e agenda — serão excluídos definitivamente após 30 dias. Sua assinatura será cancelada imediatamente.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-red-700">
                Digite seu e-mail <span className="font-mono bg-red-100 px-1 py-0.5 rounded">{userEmail}</span> para confirmar
              </label>
              <input
                type="email"
                placeholder={userEmail}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 bg-white text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                disabled={confirmEmail !== userEmail}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Excluir conta permanentemente
              </button>
              <button
                onClick={() => { setDeleteOpen(false); setConfirmEmail(""); }}
                className="px-4 py-2.5 text-sm text-neutral-600 hover:text-neutral-800 font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main ── */
export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  const content: Record<Tab, React.ReactNode> = {
    perfil: <PerfilTab />,
    assinatura: <AssinaturaTab />,
    notificacoes: <NotificacoesTab />,
    seguranca: <SegurancaTab />,
    conta: <ContaTab />,
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-neutral-900">Configurações</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Gerencie sua conta e preferências.</p>
      </div>

      {/* Tabs — horizontal scroll on mobile */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 -mx-1 px-1 scrollbar-hide">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all flex-shrink-0",
              activeTab === id
                ? "bg-rose-50 text-rose-600"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 shadow-sm">
        {content[activeTab]}
      </div>
    </div>
  );
}
