"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-8 h-8 text-neutral-400" />
        </div>
        <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 mb-2">
          Você está offline
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          Verifique sua conexão com a internet. As páginas que você visitou recentemente ainda estão disponíveis.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 font-semibold"
        >
          Tentar novamente
        </Button>
      </div>
    </div>
  );
}
