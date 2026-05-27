"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { signIn } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await signIn({
        email: form.email,
        password: form.password,
      });
      if (result?.error) setError(result.error);
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
        Bem-vinda de volta
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-7">
        Entre na sua conta para continuar.
      </p>

      {error && (
        <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="E-mail"
          type="email"
          placeholder="seuemail@exemplo.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="senha"
              className="text-sm font-medium text-neutral-700 dark:text-neutral-300"
            >
              Senha
            </label>
            <Link
              href="/recuperar-senha"
              className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <Input
            id="senha"
            type="password"
            placeholder="Sua senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
          />
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            Lembrar de mim
          </span>
        </label>

        <Button
          type="submit"
          loading={isPending}
          className="w-full justify-center py-3"
        >
          Entrar
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">ou continue com</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <GoogleButton />

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
        Não tem uma conta?{" "}
        <Link
          href="/registro"
          className="text-rose-500 hover:text-rose-600 font-semibold transition-colors"
        >
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
