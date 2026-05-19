"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { Bell, X, Gift, Package, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getNotificacoes,
  markAsRead,
  markAllAsRead,
  type Notificacao,
} from "@/lib/actions/notificacoes";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const TYPE_ICON: Record<Notificacao["type"], React.ElementType> = {
  birthday: Gift,
  low_stock: Package,
  pending_order: Clock,
};

const TYPE_COLOR: Record<Notificacao["type"], string> = {
  birthday: "bg-pink-100 dark:bg-pink-900/30 text-pink-500",
  low_stock: "bg-amber-100 dark:bg-amber-900/30 text-amber-500",
  pending_order: "bg-blue-100 dark:bg-blue-900/30 text-blue-500",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const unread = notifs.filter((n) => !n.read).length;

  const load = async () => {
    setLoading(true);
    const data = await getNotificacoes();
    setNotifs(data);
    setLoading(false);
  };

  // Initial load + realtime subscription for badge
  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("notificacoes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notificacoes" },
        (payload) => {
          setNotifs((prev) => [payload.new as Notificacao, ...prev]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // Reload on open
  useEffect(() => {
    if (open) load();
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleMarkRead = (id: string) => {
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    startTransition(() => markAsRead(id));
  };

  const handleMarkAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    startTransition(() => markAllAsRead());
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-xl text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-neutral-950" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Notificações
              {unread > 0 && (
                <span className="ml-2 text-xs bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-medium">
                  {unread}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-2">
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors"
                >
                  Marcar tudo
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="max-h-96 overflow-y-auto divide-y divide-neutral-50 dark:divide-neutral-800">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <span className="w-5 h-5 border-2 border-neutral-200 dark:border-neutral-700 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Bell className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2" />
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              notifs.map((n) => {
                const Icon = TYPE_ICON[n.type] ?? Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className={cn(
                      "w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/60",
                      !n.read && "bg-rose-50/40 dark:bg-rose-900/10"
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                        TYPE_COLOR[n.type]
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          n.read
                            ? "text-neutral-500 dark:text-neutral-400"
                            : "text-neutral-800 dark:text-neutral-100"
                        )}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5 line-clamp-2">
                        {n.body}
                      </p>
                      <p className="text-[11px] text-neutral-300 dark:text-neutral-600 mt-1">
                        {formatDistanceToNow(new Date(n.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 bg-rose-500 rounded-full shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
