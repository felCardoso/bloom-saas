"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signUp } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

const perks = [
  "7 dias de teste Pro",
  "Sem cartão de crédito",
  "Cancele quando quiser",
];

export default function RegistroPage() {
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
      const result = await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      if (result?.error) setErrors({ submit: result.error });
    });
  };

  return (
    <div className="w-full max-w-sm py-6">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden w-fit">
        <Image
          src="/logo.svg"
          width={32}
          height={32}
          className="w-8 h-8"
          alt="Bloom"
        />
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">
          Bloom
        </span>
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
        Crie sua conta grátis
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
        Comece a organizar seu negócio hoje.
      </p>

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

        <Input
          label="Senha"
          type="password"
          placeholder="Mínimo 8 caracteres"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          error={errors.password}
          autoComplete="new-password"
        />

        <Input
          label="Confirmar senha"
          type="password"
          placeholder="Repita a senha"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
          error={errors.confirm}
          autoComplete="new-password"
        />

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
              <Link
                href="/termos"
                target="_blank"
                className="text-rose-500 hover:underline font-medium"
              >
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link
                href="/privacidade"
                target="_blank"
                className="text-rose-500 hover:underline font-medium"
              >
                Política de Privacidade
              </Link>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs text-red-500 ml-6">{errors.terms}</p>
          )}
        </div>

        <Button
          type="submit"
          loading={isPending}
          className="w-full justify-center py-3"
        >
          Criar conta grátis
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          ou continue com
        </span>
        <div className="flex-1 h-px bg-neutral-100 dark:bg-neutral-800" />
      </div>

      <GoogleButton />

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
        Já tem uma conta?{" "}
        <Link
          href="/login"
          className="text-rose-500 hover:text-rose-600 font-semibold transition-colors"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
