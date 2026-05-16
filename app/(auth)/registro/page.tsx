"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";

const perks = ["14 dias de teste Pro", "Sem cartão de crédito", "Cancele quando quiser"];

export default function RegistroPage() {
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1100);
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
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {loading ? (
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

      <button
        type="button"
        className="w-full flex items-center justify-center gap-2.5 py-3 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors shadow-sm"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        Continuar com Google
      </button>

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
        Já tem uma conta?{" "}
        <Link href="/login" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
          Entrar
        </Link>
      </p>
    </div>
  );
}
