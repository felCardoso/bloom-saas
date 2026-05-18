"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { Eye, EyeOff, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmarSenhaPage() {
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else setError("Link inválido ou expirado. Solicite um novo link de recuperação.");
    });
  }, []);

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
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8">{error}</p>
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
        <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
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
          {[
            { label: "Nova senha", show: showPw, toggle: () => setShowPw(v => !v), value: password, onChange: setPassword, placeholder: "Mínimo 8 caracteres" },
            { label: "Confirmar nova senha", show: showPw2, toggle: () => setShowPw2(v => !v), value: confirm, onChange: setConfirm, placeholder: "Repita a senha" },
          ].map(({ label, show, toggle, value, onChange, placeholder }) => (
            <div key={label} className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">{label}</label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 pr-11 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500 text-white rounded-xl font-semibold text-sm hover:bg-rose-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isPending ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Redefinir senha
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
