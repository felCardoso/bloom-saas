"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Sparkles,
  Users,
  ShoppingBag,
  BarChart3,
  Calendar,
  Package,
  ArrowRight,
  Check,
  Menu,
  X,
  Bell,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestão de Clientes",
    desc: "Centralize toda a carteira com histórico de compras, aniversários, anotações e link direto para o WhatsApp.",
  },
  {
    icon: ShoppingBag,
    title: "Controle de Pedidos",
    desc: "Registre pedidos com forma de pagamento (PIX, cartão, fiado), acompanhe o status e gerencie entregas.",
  },
  {
    icon: Package,
    title: "Catálogo de Produtos",
    desc: "Organize por categorias personalizadas, controle estoque com histórico de movimentações e veja sua margem de lucro.",
  },
  {
    icon: Calendar,
    title: "Agenda Inteligente",
    desc: "Follow-ups, entregas e aniversários de clientes organizados para você nunca perder uma venda.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e Insights",
    desc: "Visualize receita, ticket médio e produtos mais vendidos para tomar decisões com confiança.",
  },
  {
    icon: Bell,
    title: "Notificações em Tempo Real",
    desc: "Alertas de estoque baixo, pedidos pendentes e aniversários via push notification e notificações in-app.",
  },
];

const plans = [
  {
    name: "Free",
    price: "Grátis",
    period: "",
    desc: "Para quem está começando",
    features: [
      "Até 30 clientes",
      "Até 20 pedidos/mês",
      "Até 20 produtos",
      "Agenda e follow-ups",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
    href: "/registro",
    primary: false,
  },
  {
    name: "Plus",
    price: "R$ 29",
    period: "/mês",
    desc: "Para revendedoras em crescimento",
    features: [
      "Até 200 clientes",
      "Até 150 pedidos/mês",
      "Relatórios e gráficos",
      "Lembretes de aniversário",
      "Alertas de estoque baixo",
      "Link rápido para WhatsApp",
      "Suporte por e-mail",
    ],
    cta: "Experimentar 14 dias",
    href: "/registro",
    primary: true,
  },
  {
    name: "Premium",
    price: "R$ 59",
    period: "/mês",
    desc: "Para top revendedoras e times",
    features: [
      "Clientes ilimitados",
      "Pedidos ilimitados",
      "Relatórios avançados",
      "Exportação de dados (CSV)",
      "Até 3 usuários",
      "Suporte prioritário",
    ],
    cta: "Assinar Premium",
    href: "/registro",
    primary: false,
  },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="w-7 h-7 sm:w-8 sm:h-8" alt="Bloom" />
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
              Bloom
            </span>
          </div>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-neutral-600 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-100 font-medium px-4 py-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              className="text-sm font-medium bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
            >
              Começar grátis
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-4 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-800 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/registro"
              onClick={() => setMenuOpen(false)}
              className="w-full text-center py-3 text-sm font-semibold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors"
            >
              Começar grátis
            </Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-16 sm:pt-24 pb-14 sm:pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 border border-rose-100">
            <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
            CRM feito para revendedoras de cosméticos
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight mb-4 sm:mb-6">
            Organize seu negócio{" "}
            <span className="text-rose-500">de beleza</span> com elegância
          </h1>
          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Gerencie clientes, pedidos e produtos em um único lugar. Feito
            especialmente para revendedoras de Mary Kay, Avon, Natura e
            similares.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/registro"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-500 text-white px-6 py-3.5 sm:py-3 rounded-xl font-semibold hover:bg-rose-600 transition-all shadow-sm text-sm"
            >
              Experimentar gratuitamente
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700 px-6 py-3.5 sm:py-3 rounded-xl font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all shadow-sm text-sm"
            >
              Já tenho conta
            </Link>
          </div>
          <p className="text-xs text-neutral-400 mt-4">
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      {/* Preview mockup */}
      <section className="px-4 sm:px-6 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="bg-linear-to-br from-rose-50 to-neutral-50 dark:from-rose-950/20 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-soft">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              {[
                { label: "Clientes", value: "248", sub: "↑ 12%" },
                { label: "Pedidos", value: "34", sub: "↑ 8%" },
                { label: "Receita", value: "R$4.820", sub: "↑ 23%" },
                { label: "Ticket Médio", value: "R$141", sub: "↑ 5%" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-card"
                >
                  <p className="text-base sm:text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    {s.value}
                  </p>
                  <p className="text-[11px] sm:text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {s.label}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-emerald-500 mt-1">
                    {s.sub} este mês
                  </p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="sm:col-span-2 bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl p-4 shadow-card">
                <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Receita dos Últimos 6 Meses
                </p>
                <div className="flex items-end gap-1.5 sm:gap-2 h-20 sm:h-24">
                  {[38, 52, 41, 68, 52, 64].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md transition-all"
                      style={{
                        height: `${h}%`,
                        background: i === 5 ? "#D4829C" : "#F2C4D4",
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-xl sm:rounded-2xl p-4 shadow-card">
                <p className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-3">
                  Por Status
                </p>
                <div className="space-y-2 sm:space-y-2">
                  {[
                    { label: "Ativas", pct: 68, color: "#D4829C" },
                    { label: "Inativas", pct: 20, color: "#E5E7EB" },
                    { label: "Prospects", pct: 12, color: "#F2C4D4" },
                  ].map((s) => (
                    <div key={s.label}>
                      <div className="flex justify-between text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mb-1">
                        <span>{s.label}</span>
                        <span>{s.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-neutral-100 dark:bg-neutral-700 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${s.pct}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 sm:mb-4">
              Tudo que você precisa para crescer
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto">
              Funcionalidades pensadas para o dia a dia da revendedora moderna.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-5 sm:p-6 border border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className="w-10 h-10 bg-rose-50 dark:bg-rose-900/30 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-rose-500" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-neutral-800 dark:text-neutral-100 mb-2">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 dark:text-neutral-100 mb-3 sm:mb-4">
              Planos simples e transparentes
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400">
              Comece grátis e escale conforme seu negócio cresce.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-5 sm:p-6 ${
                  plan.primary
                    ? "border-rose-300 bg-rose-500 text-white shadow-elevated"
                    : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-card"
                }`}
              >
                <p
                  className={`text-sm font-semibold mb-1 ${
                    plan.primary
                      ? "text-rose-100"
                      : "text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {plan.name}
                </p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span
                    className={`text-3xl font-bold ${
                      plan.primary
                        ? "text-white"
                        : "text-neutral-800 dark:text-neutral-100"
                    }`}
                  >
                    {plan.price}
                  </span>
                  <span
                    className={`text-sm ${plan.primary ? "text-rose-200" : "text-neutral-400 dark:text-neutral-500"}`}
                  >
                    {plan.period}
                  </span>
                </div>
                <p
                  className={`text-xs mb-5 sm:mb-6 ${
                    plan.primary
                      ? "text-rose-100"
                      : "text-neutral-400 dark:text-neutral-500"
                  }`}
                >
                  {plan.desc}
                </p>
                <ul className="space-y-2.5 mb-6 sm:mb-8">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2 text-sm">
                      <Check
                        className={`w-4 h-4 shrink-0 ${
                          plan.primary ? "text-rose-200" : "text-rose-500"
                        }`}
                      />
                      <span
                        className={
                          plan.primary
                            ? "text-white"
                            : "text-neutral-600 dark:text-neutral-300"
                        }
                      >
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.primary
                      ? "bg-white text-rose-600 hover:bg-rose-50"
                      : "bg-rose-500 text-white hover:bg-rose-600"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 px-4 sm:px-6 border-t border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" className="w-6 h-6" alt="Bloom" />
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-400">
              Bloom
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              { href: "/sobre", label: "Sobre" },
              { href: "/suporte", label: "Suporte" },
              { href: "/termos", label: "Termos de Uso" },
              { href: "/privacidade", label: "Privacidade" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            © 2026 Bloom · Feito com ♥ para revendedoras.
          </p>
        </div>
      </footer>
    </div>
  );
}
