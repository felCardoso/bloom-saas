"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { signIn } from "@/lib/actions/auth";
import { GoogleButton } from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Preencha e-mail e senha para continuar.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await signIn({ email: form.email, password: form.password });
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="w-full max-w-sm py-6">
      {/* Mobile logo */}
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden w-fit">
        <img src="/logo.svg" className="w-8 h-8" alt="Bloom" />
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
      </Link>

      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">Bem-vinda de volta</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-7">Entre na sua conta para continuar.</p>

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
            <label className="text-sm font-medium text-neutral-700">Senha</label>
            <Link
              href="/recuperar-senha"
              className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            className="w-4 h-4 accent-rose-500 rounded"
          />
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Lembrar de mim</span>
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          {isPending ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-neutral-100" />
        <span className="text-xs text-neutral-400">ou continue com</span>
        <div className="flex-1 h-px bg-neutral-100" />
      </div>

      <GoogleButton />

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
        Não tem uma conta?{" "}
        <Link href="/registro" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}
