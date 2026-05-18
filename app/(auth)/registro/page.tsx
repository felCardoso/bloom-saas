"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { signUp } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

const perks = ["14 dias de teste Pro", "Sem cartão de crédito", "Cancele quando quiser"];

export default function RegistroPage() {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [terms, setTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Nome é obrigatório.";
    if (!form.email.includes("@")) e.email = "Digite um e-mail válido.";
    if (form.password.length < 8) e.password = "Mínimo de 8 caracteres.";
    if (form.confirm !== form.password) e.confirm = "As senhas não coincidem.";
    if (!terms) e.terms = "Você precisa aceitar os termos para continuar.";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    startTransition(async () => {
      const result = await signUp({ name: form.name, email: form.email, password: form.password });
      if (result?.error) setErrors({ submit: result.error });
    });
  };

  const pwField = (
    show: boolean,
    toggle: () => void,
    value: string,
    onChange: (v: string) => void,
    placeholder: string,
    error?: string
  ) => (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="new-password"
          className={`w-full px-3.5 py-2.5 pr-11 rounded-xl border text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all ${
            error ? "border-red-300 bg-red-50" : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
          }`}
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );

  return (
    <div className="w-full max-w-sm py-6">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden w-fit">
        <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Crie sua conta grátis</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">Comece a organizar seu negócio hoje.</p>

      <div className="flex flex-wrap gap-1.5 mb-7">
        {perks.map((p) => (
          <span
            key={p}
            className="inline-flex items-center gap-1 text-[11px] bg-rose-50 text-rose-600 font-medium px-2.5 py-1 rounded-full border border-rose-100"
          >
            <CheckCircle2 className="w-3 h-3" />
            {p}
          </span>
        ))}
      </div>

      {errors.submit && (
        <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {errors.submit}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome completo"
          type="text"
          placeholder="Ana Silva"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          error={errors.name}
          autoComplete="name"
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          error={errors.email}
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Senha</label>
          {pwField(
            showPw,
            () => setShowPw((v) => !v),
            form.password,
            (v) => setForm({ ...form, password: v }),
            "Mínimo 8 caracteres",
            errors.password
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Confirmar senha</label>
          {pwField(
            showPw2,
            () => setShowPw2((v) => !v),
            form.confirm,
            (v) => setForm({ ...form, confirm: v }),
            "Repita a senha",
            errors.confirm
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="w-4 h-4 mt-0.5 accent-rose-500 rounded shrink-0"
            />
            <span className="text-sm text-neutral-600 dark:text-neutral-400 leading-snug">
              Concordo com os{" "}
              <Link href="/termos" target="_blank" className="text-rose-500 hover:underline font-medium">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="text-rose-500 hover:underline font-medium">
                Política de Privacidade
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-red-500 ml-6">{errors.terms}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Criar conta grátis
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
        <span className="text-xs text-neutral-400 dark:text-neutral-500">ou continue com</span>
        <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
      </div>

      <GoogleButton />

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
