"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { resetPassword } from "@/lib/actions/auth";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Digite um e-mail válido.");
      return;
    }
    setError("");
    startTransition(async () => {
      const result = await resetPassword(email);
      if (result?.error) setError(result.error);
      else setSent(true);
    });
  };

  return (
    <div className="w-full max-w-sm py-6">
      <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden w-fit">
        <Image src="/logo.svg" width={32} height={32} className="w-8 h-8" alt="Bloom" />
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
      </Link>

      {sent ? (
        <div className="text-center">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-7 h-7 text-rose-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            E-mail enviado
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
            Enviamos um link para <span className="font-medium text-neutral-700 dark:text-neutral-300">{email}</span>. Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-rose-500 hover:text-rose-600 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            Recuperar senha
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-7">
            Digite seu e-mail e enviaremos um link para redefinir sua senha.
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enviar link de recuperação
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-center text-neutral-500 dark:text-neutral-400 mt-8">
            Lembrou a senha?{" "}
            <Link href="/login" className="text-rose-500 hover:text-rose-600 font-semibold transition-colors">
              Voltar para o login
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
