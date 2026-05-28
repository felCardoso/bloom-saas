"use client";

import { Search, Zap, Settings, LogOut, Users, Package, X } from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { Avatar } from "@/components/ui/Avatar";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { usePlan } from "@/lib/plan-context";
import { useProfile } from "@/lib/profile-context";
import { signOut } from "@/lib/actions/auth";
import { searchGlobal, type SearchResultItem } from "@/lib/actions/search";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Visão geral do seu negócio" },
  "/clientes": { title: "Clientes", subtitle: "Gerencie sua carteira" },
  "/pedidos": { title: "Pedidos", subtitle: "Controle suas vendas" },
  "/produtos": { title: "Produtos", subtitle: "Catálogo e estoque" },
  "/agenda": { title: "Agenda", subtitle: "Follow-ups e lembretes" },
  "/relatorios": { title: "Relatórios", subtitle: "Análise de desempenho" },
  "/pricing": { title: "Planos", subtitle: "Gerencie sua assinatura" },
  "/configuracoes": {
    title: "Configurações",
    subtitle: "Preferências da conta",
  },
  "/feedback": { title: "Feedback", subtitle: "Ajude-nos a melhorar o Bloom" },
};

/* ── Search box reutilizável ── */
function SearchBox({
  autoFocus = false,
  onClose,
}: {
  autoFocus?: boolean;
  onClose?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      const r = await searchGlobal(trimmed);
      setResults(r);
      setOpen(true);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  function handleSelect(href: string) {
    setQuery("");
    setOpen(false);
    onClose?.();
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setOpen(false);
      setQuery("");
      onClose?.();
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setQuery(val);

    // Limpeza síncrona na hora da digitação
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
    }
  }

  const clientes = results.filter(
    (r: SearchResultItem) => r.type === "cliente",
  );
  const produtos = results.filter(
    (r: SearchResultItem) => r.type === "produto",
  );
  const showDropdown = open || loading;

  return (
    <div ref={wrapperRef} className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none z-10" />
      <input
        autoFocus={autoFocus}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Buscar cliente ou produto..."
        className="pl-9 pr-4 py-2 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl text-sm text-neutral-700 dark:text-neutral-200 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent w-full transition-all"
      />

      {showDropdown && query.trim().length >= 2 && (
        <div className="absolute right-0 top-full mt-1.5 left-0 md:left-auto md:w-72 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-elevated z-50 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <span className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-neutral-400 dark:text-neutral-500">
                Nenhum resultado para &ldquo;{query}&rdquo;
              </p>
            </div>
          ) : (
            <div className="py-2">
              {clientes.length > 0 && (
                <>
                  <p className="px-4 pt-1 pb-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Clientes
                  </p>
                  {clientes.map((r: SearchResultItem) => (
                    <button
                      key={r.id}
                      onMouseDown={() => handleSelect("/clientes")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                    >
                      <div className="w-7 h-7 bg-rose-50 dark:bg-rose-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Users className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                          {r.title}
                        </p>
                        {r.subtitle && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            {r.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}

              {produtos.length > 0 && (
                <>
                  <p className="px-4 pt-2 pb-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
                    Produtos
                  </p>
                  {produtos.map((r: SearchResultItem) => (
                    <button
                      key={r.id}
                      onMouseDown={() => handleSelect("/produtos")}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left"
                    >
                      <div className="w-7 h-7 bg-violet-50 dark:bg-violet-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <Package className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-neutral-800 dark:text-neutral-100 truncate">
                          {r.title}
                        </p>
                        {r.subtitle && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                            {r.subtitle}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Header principal ── */
export function Header() {
  const pathname = usePathname();
  const page = pageTitles[pathname] || { title: "Bloom", subtitle: "" };
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { planId, isOnTrial, trialDaysLeft } = usePlan();
  const { name, avatarUrl } = useProfile();
  const [, startTransition] = useTransition();
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <header className="h-14 lg:h-16 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 flex items-center px-4 lg:px-6 gap-3 sticky top-0 z-20">
      {/* Mobile: profile avatar with dropdown */}
      <div className="relative lg:hidden" ref={profileRef}>
        <button
          onClick={() => setProfileOpen((prev: boolean) => !prev)}
          className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2"
          aria-label="Perfil"
        >
          <Avatar name={name || "U"} src={avatarUrl} size="sm" />
        </button>

        {profileOpen && (
          <div className="absolute left-0 top-full mt-2 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-elevated overflow-hidden z-50">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
              <Avatar name={name || "U"} src={avatarUrl} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                  {name || "Minha Conta"}
                </p>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 capitalize">
                  {planId}
                </p>
              </div>
            </div>
            <div className="py-1">
              <Link
                href="/configuracoes"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                <Settings className="w-4 h-4 text-neutral-400" />
                Configurações
              </Link>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  startTransition(() => signOut());
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Title — escondido em mobile quando search está aberta */}
      <div
        className={cn(
          "flex-1 min-w-0",
          searchOpen && "hidden md:block",
        )}
      >
        <h1 className="text-sm lg:text-base font-semibold text-neutral-800 dark:text-neutral-100 truncate">
          {page.title}
        </h1>
        <p className="text-[11px] lg:text-xs text-neutral-400 dark:text-neutral-500 hidden sm:block">
          {page.subtitle}
        </p>
      </div>

      {/* Mobile search expandida — ocupa o slot do título */}
      {searchOpen && (
        <div className="flex flex-1 items-center gap-2 md:hidden">
          <div className="flex-1 min-w-0">
            <SearchBox autoFocus onClose={() => setSearchOpen(false)} />
          </div>
          <button
            onClick={() => setSearchOpen(false)}
            className="p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors shrink-0"
            aria-label="Fechar busca"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {/* Trial badge */}
        {isOnTrial && (
          <Link
            href="/configuracoes"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl text-xs font-semibold border border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
          >
            Plus · {trialDaysLeft}d
          </Link>
        )}

        {/* Upgrade chip */}
        {planId !== "premium" && !isOnTrial && (
          <Link
            href="/pricing"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors border border-rose-100 dark:border-rose-800"
          >
            <Zap className="w-3.5 h-3.5" />
            {planId === "free" ? "Upgrade" : "Plano Plus"}
          </Link>
        )}

        {/* Desktop search — always visible */}
        <div className="relative hidden md:block w-48 lg:w-56">
          <SearchBox />
        </div>

        {/* Mobile search toggle — só quando search está fechada */}
        {!searchOpen && (
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Buscar"
          >
            <Search size={18} />
          </button>
        )}

        {/* Notifications */}
        <NotificationBell />
      </div>
    </header>
  );
}
