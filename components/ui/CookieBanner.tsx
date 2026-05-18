"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const STORAGE_KEY = "bloom-cookies";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = (value: "all" | "essential") => {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 p-4 lg:p-6 animate-in slide-in-from-bottom-4 duration-300"
    >
      <div className="max-w-3xl mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 mb-1">
            Usamos cookies 🍪
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Cookies essenciais mantêm o app funcionando. Cookies analíticos nos ajudam a melhorar sua experiência.
            Em conformidade com a{" "}
            <Link href="/privacidade" className="text-rose-500 hover:underline font-medium">
              LGPD
            </Link>
            , você escolhe o que aceita.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => accept("essential")}
            className="px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
          >
            Somente essenciais
          </button>
          <button
            onClick={() => accept("all")}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 rounded-xl transition-colors shadow-sm"
          >
            Aceitar todos
          </button>
          <button
            onClick={() => accept("essential")}
            className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
