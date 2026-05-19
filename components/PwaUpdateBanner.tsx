"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export function PwaUpdateBanner() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        // Already a waiting SW (e.g. page was refreshed)
        if (reg.waiting) {
          setWaiting(reg.waiting);
        }

        // New SW found while page is open
        reg.addEventListener("updatefound", () => {
          const incoming = reg.installing;
          if (!incoming) return;
          incoming.addEventListener("statechange", () => {
            if (
              incoming.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              setWaiting(incoming);
            }
          });
        });
      });

    // When SW activates (after SKIP_WAITING), reload to get fresh content
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  function handleUpdate() {
    waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  if (!waiting || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl shadow-elevated px-4 py-3.5 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
      <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center shrink-0">
        <RefreshCw className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Nova versão disponível</p>
        <p className="text-xs opacity-60">Clique para atualizar o app</p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Atualizar
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
