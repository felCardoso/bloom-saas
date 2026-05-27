"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmarSenhaPage() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else
        setError(
          "Link inválido ou expirado. Solicite um novo link de recuperação.",
        );
    });
  }, [supabase]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setError("");
    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) setError(error.message);
      else setDone(true);
    });
  };

  if (done) {
    return (
      <div className="w-full max-w-sm py-6 text-center">
        <div className="w-14 h-14 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-7 h-7 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Senha redefinida
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          Sua senha foi atualizada com sucesso.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all shadow-sm"
        >
          Ir para o dashboard
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!ready && error) {
    return (
      <div className="w-full max-w-sm py-6 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Link inválido
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">
          {error}
        </p>
        <Link
          href="/recuperar-senha"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 transition-all shadow-sm"
        >
          Solicitar novo link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm py-6">
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
        Nova senha
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-7">
        Escolha uma senha segura para sua conta.
      </p>

      {error && ready && (
        <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {!ready && !error && (
        <div className="flex items-center justify-center py-10">
          <span className="w-6 h-6 border-2 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      )}

      {ready && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nova senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            placeholder="Repita a senha"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />

          <Button
            type="submit"
            loading={isPending}
            className="w-full justify-center py-3"
          >
            Redefinir senha
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}
    </div>
  );
}
