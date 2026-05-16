"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";

const footerLinks = [
  { href: "/sobre", label: "Sobre" },
  { href: "/suporte", label: "Suporte" },
  { href: "/termos", label: "Termos de Uso" },
  { href: "/privacidade", label: "Privacidade" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo → / */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-rose-500 rounded-xl flex items-center justify-center shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-neutral-800 dark:text-neutral-100">Bloom</span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === l.href
                    ? "text-rose-600 font-medium bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <Link
            href="/login"
            className="text-sm font-semibold bg-rose-500 text-white px-4 py-2 rounded-xl hover:bg-rose-600 transition-colors shadow-sm"
          >
            Entrar
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao início
        </Link>
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 dark:border-neutral-800 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-rose-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Bloom</span>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {footerLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">© 2026 Bloom</p>
        </div>
      </footer>
    </div>
  );
}
