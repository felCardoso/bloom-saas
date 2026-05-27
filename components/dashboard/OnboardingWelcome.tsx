"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Users, Package, ShoppingBag, ArrowRight, X, Sparkles } from "lucide-react";
import { completeOnboarding } from "@/lib/actions/profile";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Users,
    title: "Adicione sua primeira cliente",
    desc: "Cadastre nome, telefone e aniversário para nunca perder o contato.",
    href: "/clientes",
    color: "bg-rose-50 dark:bg-rose-900/20 text-rose-500",
  },
  {
    icon: Package,
    title: "Cadastre um produto",
    desc: "Registre o preço de custo, venda e estoque mínimo.",
    href: "/produtos",
    color: "bg-violet-50 dark:bg-violet-900/20 text-violet-500",
  },
  {
    icon: ShoppingBag,
    title: "Registre sua primeira venda",
    desc: "Associe produtos a uma cliente e acompanhe o status do pedido.",
    href: "/pedidos",
    color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500",
  },
];

export function OnboardingWelcome({ userName }: { userName: string }) {
  const [visible, setVisible] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleDismiss = () => {
    startTransition(async () => {
      await completeOnboarding();
      setVisible(false);
    });
  };

  if (!visible) return null;

  const firstName = userName.split(" ")[0] || "por aqui";

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="relative bg-linear-to-br from-rose-500 to-rose-600 px-5 py-5 sm:px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white" />
          <div className="absolute bottom-0 left-8 w-20 h-20 rounded-full bg-white" />
        </div>
        <div className="relative flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Bem-vinda, {firstName}
              </h2>
              <p className="text-xs text-rose-100 mt-0.5">
                Siga os 3 passos para começar a usar o Bloom.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            disabled={isPending}
            className="text-white/70 hover:text-white transition-colors shrink-0 mt-0.5"
            aria-label="Pular onboarding"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-100 dark:divide-neutral-800">
        {STEPS.map(({ icon: Icon, title, desc, href, color }, i) => (
          <Link
            key={href}
            href={href}
            className="flex items-start gap-3 p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors group"
          >
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", color)}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wide">
                  Passo {i + 1}
                </span>
              </div>
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 leading-snug">
                {title}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                {desc}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-neutral-300 dark:text-neutral-600 group-hover:text-rose-400 transition-colors shrink-0 mt-1" />
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <p className="text-xs text-neutral-400">Você pode acessar o menu lateral a qualquer momento.</p>
        <button
          onClick={handleDismiss}
          disabled={isPending}
          className="inline-flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 hover:text-rose-500 font-medium transition-colors disabled:opacity-50"
        >
          {isPending ? (
            "Salvando…"
          ) : (
            <>
              Tudo pronto, pular
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
