"use client";

import { useState, useTransition, useEffect } from "react";
import {
  User,
  CreditCard,
  Bell,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Check,
  Download,
  AlertTriangle,
  Monitor,
  Smartphone,
  LogOut,
  Zap,
  Sun,
  Moon,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { usePlan } from "@/lib/plan-context";
import { useTheme, type PrimaryColor } from "@/lib/theme-context";

import { updateProfile, updateNotificationPrefs, type NotificationPrefs } from "@/lib/actions/profile";
import { savePushSubscription, deletePushSubscription } from "@/lib/actions/push";
import { createClient } from "@/lib/supabase/client";
import { AvatarUpload } from "@/components/ui/AvatarUpload";

type Tab = "perfil" | "assinatura" | "notificacoes" | "aparencia" | "seguranca" | "conta";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "assinatura", label: "Assinatura", icon: CreditCard },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "aparencia", label: "Aparência", icon: Palette },
  { id: "seguranca", label: "Segurança", icon: Shield },
  { id: "conta", label: "Conta", icon: Trash2 },
];

const PLAN_BADGE: Record<string, string> = {
  free: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  pro: "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400",
  premium: "bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400",
};
const PLAN_CARD: Record<string, string> = {
  free: "from-neutral-50 to-neutral-100 border-neutral-200 dark:from-neutral-800 dark:to-neutral-900 dark:border-neutral-700",
  pro: "from-rose-50 to-rose-100 border-rose-200 dark:from-rose-950 dark:to-rose-900/40 dark:border-rose-800",
  premium: "from-violet-50 to-violet-100 border-violet-200 dark:from-violet-950 dark:to-violet-900/40 dark:border-violet-800",
};
const PLAN_ACCENT: Record<string, string> = {
  free: "text-neutral-600 dark:text-neutral-300",
  pro: "text-rose-600 dark:text-rose-400",
  premium: "text-violet-600 dark:text-violet-400",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 dark:focus:ring-offset-neutral-900",
        checked ? "bg-rose-500" : "bg-neutral-200 dark:bg-neutral-700",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-0.5",
          checked ? "translate-x-4" : "translate-x-0.5",
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
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400"
          : "bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-60",
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
function PerfilTab({ initialProfile }: {
  initialProfile: { name: string; email: string; phone: string; brand: string; avatarUrl: string | null };
}) {
  const [form, setForm] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      const result = await updateProfile(form);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  return (
    <div className="space-y-8">
      <AvatarUpload
        name={form.name}
        avatarUrl={form.avatarUrl}
        onUpdate={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
      />

      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

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
          hint="Ao alterar, você receberá um e-mail de confirmação."
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

      <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
      </div>
    </div>
  );
}

function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/asaas/portal", { method: "POST" });
    const { url, error } = await res.json();
    if (url) window.location.href = url;
    else { console.error(error); setLoading(false); }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
      <div>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Gerenciar assinatura</p>
        <p className="text-xs text-neutral-400 mt-0.5">Altere o método de pagamento, veja faturas ou cancele.</p>
      </div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors disabled:opacity-60 sm:shrink-0"
      >
        {loading ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : "Gerenciar pagamento"}
      </button>
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
      <div className={cn("rounded-2xl border bg-linear-to-br p-5 sm:p-6", PLAN_CARD[planId])}>
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
                <span className="text-sm text-neutral-500 dark:text-neutral-400">/mês</span>
              )}
            </div>
          </div>
          {planId !== "premium" && (
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors shadow-sm shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              Fazer upgrade
            </Link>
          )}
        </div>
        <div className="border-t border-black/5 dark:border-white/5 pt-4">
          <p className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 mb-2.5">Incluído no seu plano</p>
          <ul className="space-y-1.5">
            {featureList.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300">
                <Check className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {plan.price > 0 && (
        <ManageSubscriptionButton />
      )}

      {planId === "free" && (
        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Experimente o plano Pro grátis</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">14 dias, sem cartão de crédito.</p>
          </div>
          <Link
            href="/pricing"
            className="self-start sm:self-auto px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 transition-colors"
          >
            Testar Pro
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── Notificações ── */
function NotificacoesTab({ initialNotifs }: { initialNotifs: NotificationPrefs }) {
  const { hasFeature } = usePlan();
  const [notifs, setNotifs] = useState<NotificationPrefs>(initialNotifs);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const toggle = (key: keyof NotificationPrefs) => {
    setNotifs((v) => ({ ...v, [key]: !v[key] }));
    setSaved(false);
  };

  const handlePushToggle = async () => {
    if (!notifs.push) {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        alert("Seu navegador não suporta notificações push.");
        return;
      }
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Permissão negada. Habilite notificações nas configurações do navegador.");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        });
        await savePushSubscription(sub.toJSON() as Parameters<typeof savePushSubscription>[0]);
        toggle("push");
      } catch {
        alert("Não foi possível ativar as notificações push. Tente novamente.");
      }
    } else {
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await deletePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        toggle("push");
      } catch {
        toggle("push");
      }
    }
  };

  const handleSave = () => {
    setError("");
    startTransition(async () => {
      const result = await updateNotificationPrefs(notifs);
      if (result?.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  const rows: { key: keyof NotificationPrefs; label: string; desc: string; locked?: boolean }[] = [
    { key: "birthdays", label: "Lembretes de aniversário", desc: "Aviso 1 dia antes do aniversário de clientes.", locked: !hasFeature("birthdayReminders") },
    { key: "pendingOrders", label: "Pedidos pendentes há 7+ dias", desc: "Alerta quando um pedido está sem atualização." },
    { key: "stockAlerts", label: "Estoque baixo (≤ 5 unidades)", desc: "Notificação quando produtos estão acabando.", locked: !hasFeature("stockAlerts") },
    { key: "newsletter", label: "Dicas e novidades por e-mail", desc: "Conteúdo sobre vendas, beleza e gestão." },
    { key: "push", label: "Notificações no navegador", desc: "Alertas em tempo real mesmo com o app fechado." },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-50 dark:divide-neutral-800">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center justify-between px-5 py-4 gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{row.label}</p>
                {row.locked && (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-semibold border border-amber-100 dark:border-amber-800">
                    Pro+
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">{row.desc}</p>
            </div>
            <Toggle
              checked={notifs[row.key]}
              onChange={() => {
                if (row.locked) return;
                if (row.key === "push") handlePushToggle();
                else toggle(row.key);
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <SaveButton saved={saved} loading={isPending} onClick={handleSave} />
      </div>
    </div>
  );
}

/* ── Aparência ── */
const PRIMARY_OPTIONS: { id: PrimaryColor; label: string; bg: string; ring: string }[] = [
  { id: "rose", label: "Rosa", bg: "bg-rose-500", ring: "ring-rose-500" },
  { id: "violet", label: "Violeta", bg: "bg-violet-500", ring: "ring-violet-500" },
  { id: "blue", label: "Azul", bg: "bg-blue-500", ring: "ring-blue-500" },
  { id: "teal", label: "Verde-água", bg: "bg-teal-500", ring: "ring-teal-500" },
  { id: "amber", label: "Âmbar", bg: "bg-amber-500", ring: "ring-amber-500" },
];

function AparenciaTab() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Tema</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Escolha entre o tema claro e escuro.</p>
        <div className="grid grid-cols-2 gap-3 max-w-xs">
          {([{ id: "light", label: "Claro", icon: Sun }, { id: "dark", label: "Escuro", icon: Moon }] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                theme === id
                  ? "border-rose-500 bg-rose-50 dark:bg-rose-900/20"
                  : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-600",
              )}
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", theme === id ? "bg-rose-500 text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400")}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={cn("text-sm font-medium", theme === id ? "text-rose-600 dark:text-rose-400" : "text-neutral-600 dark:text-neutral-400")}>
                {label}
              </span>
              {theme === id && <Check className="w-4 h-4 text-rose-500 -mt-1" />}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Cor principal</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">Personaliza botões, links e destaques em todo o sistema.</p>
        <div className="flex flex-wrap gap-3">
          {PRIMARY_OPTIONS.map(({ id, label, bg, ring }) => (
            <button
              key={id}
              onClick={() => setPrimaryColor(id)}
              title={label}
              className="group relative flex flex-col items-center gap-1.5 transition-all"
            >
              <div className={cn("w-9 h-9 rounded-full transition-all", bg, primaryColor === id ? `ring-2 ring-offset-2 ring-offset-white dark:ring-offset-neutral-900 ${ring} scale-110` : "hover:scale-105 opacity-70 hover:opacity-100")}>
                {primaryColor === id && <Check className="w-4 h-4 text-white absolute inset-0 m-auto" />}
              </div>
              <span className={cn("text-[11px] font-medium", primaryColor === id ? "text-neutral-800 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-500")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Segurança ── */
type SessionInfo = { label: string; since: string; Icon: React.ElementType };

function parseUserAgent(ua: string): Pick<SessionInfo, "label" | "Icon"> {
  let browser = "Navegador";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("OPR/") || ua.includes("Opera/")) browser = "Opera";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Safari/")) browser = "Safari";

  let device = "Desktop";
  let Icon: React.ElementType = Monitor;
  if (/iPad/.test(ua)) { device = "iPad"; Icon = Smartphone; }
  else if (/iPhone|iPod/.test(ua)) { device = "iPhone"; Icon = Smartphone; }
  else if (/Android/.test(ua)) { device = "Android"; Icon = Smartphone; }
  else if (/Windows/.test(ua)) device = "Windows";
  else if (/Macintosh|Mac OS X/.test(ua)) device = "Mac";
  else if (/Linux/.test(ua)) device = "Linux";

  return { label: `${browser} · ${device}`, Icon };
}

function formatSince(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function SegurancaTab() {
  const [showNew, setShowNew] = useState(false);
  const [pw, setPw] = useState({ next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [revokeLoading, setRevokeLoading] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!s) return;
      const { label, Icon } = parseUserAgent(navigator.userAgent);
      setSession({ label, Icon, since: formatSince(s.user.last_sign_in_at ?? s.user.created_at) });
    });
  }, []);

  const handleChangePw = async () => {
    if (pw.next.length < 8) { setPwError("Nova senha precisa ter ao menos 8 caracteres."); return; }
    if (pw.next !== pw.confirm) { setPwError("A confirmação não bate com a nova senha."); return; }
    setPwError("");
    setPwLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw.next });
    setPwLoading(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setPw({ next: "", confirm: "" });
      setTimeout(() => setPwSaved(false), 3000);
    }
  };

  const handleRevokeOthers = async () => {
    setRevokeLoading(true);
    setRevokeMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut({ scope: "others" });
    setRevokeLoading(false);
    setRevokeMsg(error ? "error" : "success");
    setTimeout(() => setRevokeMsg(null), 4000);
  };

  const pwInputClass =
    "w-full px-3.5 py-2.5 pr-11 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-4">Alterar senha</h3>
        <div className="space-y-4 max-w-sm">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Nova senha</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                placeholder="Mínimo 8 caracteres"
                value={pw.next}
                onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwError(""); }}
                className={pwInputClass}
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

      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">Sessões ativas</h3>

        {/* Current device */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
          <div className="w-9 h-9 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            {session ? <session.Icon className="w-4 h-4 text-neutral-500 dark:text-neutral-400" /> : <Monitor className="w-4 h-4 text-neutral-300" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                {session?.label ?? "Carregando…"}
              </p>
              <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md font-semibold shrink-0">
                Este dispositivo
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              {session ? `Último acesso: ${session.since}` : "—"}
            </p>
          </div>
        </div>

        {/* Revoke others */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Encerrar outras sessões</p>
            <p className="text-xs text-neutral-400 mt-0.5">Desconecta todos os outros dispositivos onde sua conta está ativa.</p>
          </div>
          <button
            onClick={handleRevokeOthers}
            disabled={revokeLoading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-800 transition-colors disabled:opacity-50 shrink-0"
          >
            {revokeLoading
              ? <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              : <LogOut className="w-3.5 h-3.5" />}
            Encerrar outras sessões
          </button>
        </div>

        {revokeMsg === "success" && (
          <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" /> Outras sessões encerradas com sucesso.
          </p>
        )}
        {revokeMsg === "error" && (
          <p className="text-xs text-red-500">Não foi possível encerrar as sessões. Tente novamente.</p>
        )}
      </div>
    </div>
  );
}

/* ── Conta ── */
function ContaTab({ userEmail }: { userEmail: string }) {
  const { hasFeature } = usePlan();
  const [confirmEmail, setConfirmEmail] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  async function handleExport(type: "clientes" | "produtos" | "pedidos") {
    setExportLoading(type);
    try {
      const res = await fetch(`/api/export/csv?type=${type}`);
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Exportar meus dados</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Baixe arquivos CSV com seus clientes, pedidos e produtos.
        </p>
        {hasFeature("csvExport") ? (
          <div className="flex flex-wrap gap-2">
            {(["clientes", "produtos", "pedidos"] as const).map((type) => (
              <button
                key={type}
                onClick={() => handleExport(type)}
                disabled={exportLoading === type}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 rounded-xl text-sm font-semibold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-60 capitalize"
              >
                {exportLoading === type ? (
                  <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                {type}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div>
              <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Disponível no plano Premium</p>
              <p className="text-xs text-neutral-400 mt-0.5">Faça upgrade para exportar seus dados a qualquer momento.</p>
            </div>
            <Link href="/pricing" className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 text-white text-xs font-semibold rounded-xl hover:bg-rose-600 transition-colors">
              <Zap className="w-3.5 h-3.5" />
              Upgrade
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-semibold text-red-600 mb-1">Zona de perigo</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
          Ações irreversíveis que afetam permanentemente sua conta.
        </p>
        {!deleteOpen ? (
          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800 rounded-xl text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir minha conta
          </button>
        ) : (
          <div className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">Esta ação é permanente e irreversível</p>
                <p className="text-xs text-red-600 dark:text-red-500 mt-1 leading-relaxed">
                  Todos os seus dados serão excluídos definitivamente após 30 dias. Sua assinatura será cancelada imediatamente.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-red-700 dark:text-red-400">
                Digite seu e-mail{" "}
                <span className="font-mono bg-red-100 dark:bg-red-900/40 px-1 py-0.5 rounded">{userEmail}</span>{" "}
                para confirmar
              </label>
              <input
                type="email"
                placeholder={userEmail}
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-red-300 dark:border-red-700 bg-white dark:bg-neutral-900 text-sm text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all"
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
                className="px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 font-medium transition-colors"
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
export interface ConfiguracoesClientProps {
  initialProfile: { name: string; email: string; phone: string; brand: string; avatarUrl: string | null };
  initialNotifs: NotificationPrefs;
}

export default function ConfiguracoesClient({ initialProfile, initialNotifs }: ConfiguracoesClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>("perfil");

  const content: Record<Tab, React.ReactNode> = {
    perfil: <PerfilTab initialProfile={initialProfile} />,
    assinatura: <AssinaturaTab />,
    notificacoes: <NotificacoesTab initialNotifs={initialNotifs} />,
    aparencia: <AparenciaTab />,
    seguranca: <SegurancaTab />,
    conta: <ContaTab userEmail={initialProfile.email} />,
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all shrink-0",
              activeTab === id
                ? "bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-700 dark:hover:text-neutral-200",
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 sm:p-5 shadow-card">
        {content[activeTab]}
      </div>
    </div>
  );
}
